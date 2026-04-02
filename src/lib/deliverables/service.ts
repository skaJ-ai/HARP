import { generateText } from 'ai';
import { and, desc, eq, ne, sql } from 'drizzle-orm';

import { getChatModel } from '@/lib/ai/provider';
import { EXAMPLE_TEXT_PROMPT_MAX_LENGTH } from '@/lib/ai/session-chat';
import { getDb } from '@/lib/db';
import type { DeliverableSection, DeliverableStatus, TemplateType } from '@/lib/db/schema';
import { deliverablesTable, messagesTable, sessionsTable, sourcesTable } from '@/lib/db/schema';
import { searchMemoryChunksHybrid } from '@/lib/memory/retrieval';
import { safeReplaceMemoryChunksForDeliverable } from '@/lib/memory/service';
import { getTemplateByType } from '@/lib/templates';

import {
  buildDeliverableMarkdown,
  buildRenderableDeliverableMarkdown,
  parseDeliverableMarkdown,
} from './parser';
import { TONE_LABELS, TONE_SYSTEM_PROMPTS } from './tone-prompts';

import type { DeliverableDetail, DeliverableSummary, DeliverableTone } from './types';

const REFERENCE_CONTEXT_DELIVERABLE_LIMIT = 3;
const REFERENCE_SECTION_SUMMARY_MAX_LENGTH = 200;
const SEMANTIC_REFERENCE_LIMIT = 4;
const SEMANTIC_REFERENCE_MAX_LENGTH = 320;

function createDeliverableSummary({
  createdAt,
  id,
  sections,
  sessionId,
  status,
  templateType,
  title,
  updatedAt,
  version,
}: {
  createdAt: Date;
  id: string;
  sections: DeliverableSection[];
  sessionId: string | null;
  status: DeliverableStatus;
  templateType: TemplateType;
  title: string;
  updatedAt: Date;
  version: number;
}): DeliverableSummary {
  const previewSection = sections.find((section) => section.content.trim().length > 0);

  return {
    createdAt: createdAt.toISOString(),
    id,
    preview: previewSection?.content.slice(0, 240) ?? '미리보기 없음',
    sectionCount: sections.length,
    sessionId,
    status,
    templateType,
    title,
    updatedAt: updatedAt.toISOString(),
    version,
  };
}

function createDeliverableDetail({
  createdAt,
  id,
  sections,
  sessionId,
  status,
  templateType,
  title,
  updatedAt,
  version,
}: {
  createdAt: Date;
  id: string;
  sections: DeliverableSection[];
  sessionId: string | null;
  status: DeliverableStatus;
  templateType: TemplateType;
  title: string;
  updatedAt: Date;
  version: number;
}): DeliverableDetail {
  const template = getTemplateByType(templateType);

  return {
    ...createDeliverableSummary({
      createdAt,
      id,
      sections,
      sessionId,
      status,
      templateType,
      title,
      updatedAt,
      version,
    }),
    markdown: buildDeliverableMarkdown(title, sections),
    renderMarkdown: buildRenderableDeliverableMarkdown(title, sections),
    sections,
    templateName: template.name,
  };
}

function assertDeliverableStatusTransition(
  currentStatus: DeliverableStatus,
  nextStatus: DeliverableStatus,
): void {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions: Record<DeliverableStatus, DeliverableStatus[]> = {
    draft: ['final'],
    final: ['promoted_asset'],
    promoted_asset: [],
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new Error('허용되지 않은 산출물 상태 전이입니다.');
  }
}

function buildSectionSummary(section: DeliverableSection): string {
  const content = section.content.trim().replace(/\s+/g, ' ');
  const summary = content.slice(0, REFERENCE_SECTION_SUMMARY_MAX_LENGTH);
  const sectionMeta = `confidence=${section.confidence}, cited=${section.cited}`;

  return `- ${section.name} [${sectionMeta}]: ${summary}${content.length > REFERENCE_SECTION_SUMMARY_MAX_LENGTH ? '...' : ''}`;
}

function buildTieredReferenceContext(
  referenceDeliverables: {
    sections: DeliverableSection[];
    title: string;
  }[],
): string {
  if (referenceDeliverables.length === 0) {
    return '참고할 이전 동일 유형 산출물 없음';
  }

  const contextParts: string[] = [];

  const latestReferenceDeliverable = referenceDeliverables[0];

  if (latestReferenceDeliverable) {
    contextParts.push(
      '[가장 최근 산출물 — 전체 참고]',
      buildDeliverableMarkdown(
        latestReferenceDeliverable.title,
        latestReferenceDeliverable.sections,
      ),
    );
  }

  const summarizedReferenceDeliverable = referenceDeliverables[1];

  if (summarizedReferenceDeliverable) {
    contextParts.push(
      `[이전 산출물 — 요약 참고] ${summarizedReferenceDeliverable.title}`,
      summarizedReferenceDeliverable.sections.map(buildSectionSummary).join('\n'),
    );
  }

  const structuralReferenceDeliverable = referenceDeliverables[2];

  if (structuralReferenceDeliverable) {
    contextParts.push(
      `[과거 산출물 — 구조 참고] ${structuralReferenceDeliverable.title}`,
      `- 섹션: ${structuralReferenceDeliverable.sections.map((section) => section.name).join(', ')}`,
    );
  }

  return contextParts.join('\n\n');
}

function buildGenerationRetrievalQuery({
  messages,
  sessionTitle,
  sources,
}: {
  messages: {
    content: string;
    role: 'assistant' | 'system' | 'user';
  }[];
  sessionTitle: string;
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
}): string {
  const recentUserContext = messages
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => message.content.trim().replace(/\s+/g, ' '))
    .join('\n');
  const sourceContext = sources
    .slice(0, 3)
    .map((source, index) => {
      const label = source.label ?? `자료 ${index + 1}`;

      return `${label}: ${source.content.trim().replace(/\s+/g, ' ').slice(0, 400)}`;
    })
    .join('\n');

  return [sessionTitle, recentUserContext, sourceContext]
    .filter((value) => value.length > 0)
    .join('\n');
}

function buildSemanticReferenceContext(
  semanticReferences: Awaited<ReturnType<typeof searchMemoryChunksHybrid>>,
): string {
  if (semanticReferences.length === 0) {
    return '';
  }

  return [
    '[의미 기반 참고 자산]',
    ...semanticReferences.map((reference) => {
      const referenceContent = reference.content.trim().replace(/\s+/g, ' ');
      const contentPreview = referenceContent.slice(0, SEMANTIC_REFERENCE_MAX_LENGTH);
      const kindLabel = reference.kind === 'deliverable_section' ? 'deliverable_section' : 'source';
      const sectionLabel =
        reference.kind === 'deliverable_section' && reference.sectionName
          ? ` | ${reference.sectionName}`
          : '';

      return `- [${kindLabel} | ${reference.title}${sectionLabel} | score=${reference.score.toFixed(2)}] ${contentPreview}${referenceContent.length > SEMANTIC_REFERENCE_MAX_LENGTH ? '...' : ''}`;
    }),
  ].join('\n');
}

function buildGenerationPromptContext({
  exampleText,
  referenceDeliverables,
  messages,
  semanticReferences,
  sessionTitle,
  sources,
  templateType,
}: {
  exampleText?: string | null;
  referenceDeliverables: {
    sections: DeliverableSection[];
    title: string;
  }[];
  messages: {
    content: string;
    role: 'assistant' | 'system' | 'user';
  }[];
  semanticReferences: Awaited<ReturnType<typeof searchMemoryChunksHybrid>>;
  sessionTitle: string;
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
  templateType: TemplateType;
}): string {
  const template = getTemplateByType(templateType);
  const conversationTranscript =
    messages.length > 0
      ? messages
          .map((message) => {
            const roleLabel =
              message.role === 'user' ? '담당자' : message.role === 'assistant' ? 'HARP' : '시스템';

            return `- ${roleLabel}: ${message.content.trim().replace(/\s+/g, ' ').slice(0, 1600)}`;
          })
          .join('\n')
      : '- 대화 기록 없음';
  const sourceContext =
    sources.length > 0
      ? sources
          .map((source, index) => {
            const label = source.label ?? `자료 ${index + 1}`;
            const sourceType = source.type ?? 'text';
            const content = source.content.trim().replace(/\s+/g, ' ').slice(0, 2000);

            return `- [${label} | ${sourceType}] ${content}`;
          })
          .join('\n')
      : '- 첨부된 근거자료 없음';
  const referenceContext = buildTieredReferenceContext(referenceDeliverables);
  const semanticReferenceContext = buildSemanticReferenceContext(semanticReferences);
  const exampleContext =
    exampleText && exampleText.trim().length > 0
      ? `${exampleText.trim().slice(0, EXAMPLE_TEXT_PROMPT_MAX_LENGTH)}${exampleText.trim().length > EXAMPLE_TEXT_PROMPT_MAX_LENGTH ? '...' : ''}`
      : null;

  return [
    `[문서 제목] ${sessionTitle}`,
    '',
    '[현재 세션 대화 기록]',
    conversationTranscript,
    '',
    '[현재 세션 근거자료]',
    sourceContext,
    '',
    ...(exampleContext ? ['[사용자 제공 예시 문서 — 스타일 참고]', exampleContext, ''] : []),
    '[이전 동일 유형 산출물 — 최근 3건, 상세→구조 순]',
    referenceContext,
    '',
    ...(semanticReferenceContext.length > 0 ? [semanticReferenceContext, ''] : []),
    '[작성 요청]',
    `${template.name} 템플릿 기준으로 초안을 완성해 주세요.`,
    '이전 산출물이 있으면 톤, 구조, 용어를 참고하되 내용은 현재 세션 데이터 기준으로 작성합니다.',
  ].join('\n');
}

async function listDeliverablesByWorkspace(workspaceId: string): Promise<DeliverableSummary[]> {
  const database = getDb();
  const deliverableRows = await database
    .select({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    })
    .from(deliverablesTable)
    .where(eq(deliverablesTable.workspaceId, workspaceId))
    .orderBy(desc(deliverablesTable.updatedAt));

  return deliverableRows.map((deliverableRow) =>
    createDeliverableSummary({
      createdAt: deliverableRow.createdAt,
      id: deliverableRow.id,
      sections: deliverableRow.sections,
      sessionId: deliverableRow.sessionId,
      status: deliverableRow.status,
      templateType: deliverableRow.templateType,
      title: deliverableRow.title,
      updatedAt: deliverableRow.updatedAt,
      version: deliverableRow.version,
    }),
  );
}

async function listRecentReferenceDeliverablesByTemplate({
  excludeSessionId,
  limit,
  templateType,
  workspaceId,
}: {
  excludeSessionId?: string;
  limit: number;
  templateType: TemplateType;
  workspaceId: string;
}): Promise<DeliverableSummary[]> {
  const database = getDb();
  const filters = [
    eq(deliverablesTable.workspaceId, workspaceId),
    eq(deliverablesTable.templateType, templateType),
  ];

  if (excludeSessionId) {
    filters.push(ne(deliverablesTable.sessionId, excludeSessionId));
  }

  const deliverableRows = await database
    .select({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    })
    .from(deliverablesTable)
    .where(and(...filters))
    .orderBy(desc(deliverablesTable.updatedAt))
    .limit(limit);

  return deliverableRows.map((deliverableRow) =>
    createDeliverableSummary({
      createdAt: deliverableRow.createdAt,
      id: deliverableRow.id,
      sections: deliverableRow.sections,
      sessionId: deliverableRow.sessionId,
      status: deliverableRow.status,
      templateType: deliverableRow.templateType,
      title: deliverableRow.title,
      updatedAt: deliverableRow.updatedAt,
      version: deliverableRow.version,
    }),
  );
}

async function getLatestDeliverableSummaryForSession(
  sessionId: string,
  workspaceId: string,
): Promise<DeliverableSummary | null> {
  const database = getDb();
  const deliverableRows = await database
    .select({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    })
    .from(deliverablesTable)
    .where(
      and(
        eq(deliverablesTable.sessionId, sessionId),
        eq(deliverablesTable.workspaceId, workspaceId),
      ),
    )
    .orderBy(desc(deliverablesTable.updatedAt))
    .limit(1);

  const deliverableRow = deliverableRows[0];

  if (!deliverableRow) {
    return null;
  }

  return createDeliverableSummary({
    createdAt: deliverableRow.createdAt,
    id: deliverableRow.id,
    sections: deliverableRow.sections,
    sessionId: deliverableRow.sessionId,
    status: deliverableRow.status,
    templateType: deliverableRow.templateType,
    title: deliverableRow.title,
    updatedAt: deliverableRow.updatedAt,
    version: deliverableRow.version,
  });
}

async function getDeliverableDetailForWorkspace(
  deliverableId: string,
  workspaceId: string,
): Promise<DeliverableDetail | null> {
  const database = getDb();
  const deliverableRows = await database
    .select({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    })
    .from(deliverablesTable)
    .where(
      and(eq(deliverablesTable.id, deliverableId), eq(deliverablesTable.workspaceId, workspaceId)),
    )
    .limit(1);

  const deliverableRow = deliverableRows[0];

  if (!deliverableRow) {
    return null;
  }

  return createDeliverableDetail({
    createdAt: deliverableRow.createdAt,
    id: deliverableRow.id,
    sections: deliverableRow.sections,
    sessionId: deliverableRow.sessionId,
    status: deliverableRow.status,
    templateType: deliverableRow.templateType,
    title: deliverableRow.title,
    updatedAt: deliverableRow.updatedAt,
    version: deliverableRow.version,
  });
}

async function generateDeliverableForSession({
  sessionId,
  workspaceId,
}: {
  sessionId: string;
  workspaceId: string;
}): Promise<DeliverableDetail> {
  const database = getDb();
  const sessionRows = await database
    .select({
      exampleText: sessionsTable.exampleText,
      id: sessionsTable.id,
      status: sessionsTable.status,
      templateType: sessionsTable.templateType,
      title: sessionsTable.title,
    })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);
  const sessionRow = sessionRows[0];

  if (!sessionRow) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  const [messageRows, sourceRows, referenceRows, latestSessionDeliverableRows] = await Promise.all([
    database
      .select({
        content: messagesTable.content,
        role: messagesTable.role,
      })
      .from(messagesTable)
      .where(eq(messagesTable.sessionId, sessionId))
      .orderBy(messagesTable.createdAt),
    database
      .select({
        content: sourcesTable.content,
        label: sourcesTable.label,
        type: sourcesTable.type,
      })
      .from(sourcesTable)
      .where(eq(sourcesTable.sessionId, sessionId))
      .orderBy(desc(sourcesTable.createdAt)),
    database
      .select({
        sections: deliverablesTable.sections,
        title: deliverablesTable.title,
      })
      .from(deliverablesTable)
      .where(
        and(
          eq(deliverablesTable.workspaceId, workspaceId),
          eq(deliverablesTable.templateType, sessionRow.templateType),
          ne(deliverablesTable.sessionId, sessionId),
        ),
      )
      .orderBy(desc(deliverablesTable.updatedAt))
      .limit(REFERENCE_CONTEXT_DELIVERABLE_LIMIT),
    database
      .select({
        createdAt: deliverablesTable.createdAt,
        id: deliverablesTable.id,
        sections: deliverablesTable.sections,
        sessionId: deliverablesTable.sessionId,
        status: deliverablesTable.status,
        templateType: deliverablesTable.templateType,
        title: deliverablesTable.title,
        updatedAt: deliverablesTable.updatedAt,
        version: deliverablesTable.version,
      })
      .from(deliverablesTable)
      .where(
        and(
          eq(deliverablesTable.workspaceId, workspaceId),
          eq(deliverablesTable.sessionId, sessionId),
        ),
      )
      .orderBy(desc(deliverablesTable.updatedAt))
      .limit(1),
  ]);

  const template = getTemplateByType(sessionRow.templateType);
  const semanticReferences = await searchMemoryChunksHybrid({
    currentSessionId: sessionId,
    limit: SEMANTIC_REFERENCE_LIMIT,
    mode: 'generation',
    query: buildGenerationRetrievalQuery({
      messages: messageRows,
      sessionTitle: sessionRow.title ?? template.name,
      sources: sourceRows,
    }),
    templateType: sessionRow.templateType,
    workspaceId,
  }).catch((error) => {
    console.error('Failed to fetch semantic references for deliverable generation.', {
      error,
      sessionId,
      workspaceId,
    });

    return [];
  });
  const generationResult = await generateText({
    model: getChatModel(),
    prompt: buildGenerationPromptContext({
      exampleText: sessionRow.exampleText,
      referenceDeliverables: referenceRows,
      messages: messageRows,
      semanticReferences,
      sessionTitle: sessionRow.title ?? template.name,
      sources: sourceRows,
      templateType: sessionRow.templateType,
    }),
    system: template.systemPrompt.generate,
    temperature: 0.2,
  });
  const parsedDeliverable = parseDeliverableMarkdown({
    rawMarkdown: generationResult.text,
    templateType: sessionRow.templateType,
  });

  if (!parsedDeliverable) {
    throw new Error('AI 산출물 형식을 해석하지 못했습니다.');
  }

  const latestSessionDeliverable = latestSessionDeliverableRows[0];
  const nextVersion = (latestSessionDeliverable?.version ?? 0) + 1;
  const nextTitle = sessionRow.title ?? template.name;

  return database.transaction(async (transaction) => {
    let persistedDeliverableId = latestSessionDeliverable?.id ?? null;

    if (latestSessionDeliverable?.status === 'draft') {
      await transaction
        .update(deliverablesTable)
        .set({
          sections: parsedDeliverable.sections,
          title: nextTitle,
          updatedAt: sql`now()`,
          version: nextVersion,
        })
        .where(eq(deliverablesTable.id, latestSessionDeliverable.id));
      persistedDeliverableId = latestSessionDeliverable.id;
    } else {
      const createdDeliverables = await transaction
        .insert(deliverablesTable)
        .values({
          sections: parsedDeliverable.sections,
          sessionId,
          status: 'draft',
          templateType: sessionRow.templateType,
          title: nextTitle,
          version: nextVersion,
          workspaceId,
        })
        .returning({ id: deliverablesTable.id });

      persistedDeliverableId = createdDeliverables[0]?.id ?? null;
    }

    if (!persistedDeliverableId) {
      throw new Error('산출물 저장에 실패했습니다.');
    }

    await transaction
      .update(sessionsTable)
      .set({
        status: 'completed',
        updatedAt: sql`now()`,
      })
      .where(eq(sessionsTable.id, sessionId));

    const persistedDeliverableRows = await transaction
      .select({
        createdAt: deliverablesTable.createdAt,
        id: deliverablesTable.id,
        sections: deliverablesTable.sections,
        sessionId: deliverablesTable.sessionId,
        status: deliverablesTable.status,
        templateType: deliverablesTable.templateType,
        title: deliverablesTable.title,
        updatedAt: deliverablesTable.updatedAt,
        version: deliverablesTable.version,
      })
      .from(deliverablesTable)
      .where(eq(deliverablesTable.id, persistedDeliverableId))
      .limit(1);

    const persistedDeliverable = persistedDeliverableRows[0];

    if (!persistedDeliverable) {
      throw new Error('저장된 산출물을 다시 찾을 수 없습니다.');
    }

    return createDeliverableDetail({
      createdAt: persistedDeliverable.createdAt,
      id: persistedDeliverable.id,
      sections: persistedDeliverable.sections,
      sessionId: persistedDeliverable.sessionId,
      status: persistedDeliverable.status,
      templateType: persistedDeliverable.templateType,
      title: persistedDeliverable.title,
      updatedAt: persistedDeliverable.updatedAt,
      version: persistedDeliverable.version,
    });
  });
}

async function updateDeliverableForWorkspace({
  deliverableId,
  markdown,
  status,
  title,
  workspaceId,
}: {
  deliverableId: string;
  markdown?: string;
  status?: DeliverableStatus;
  title?: string;
  workspaceId: string;
}): Promise<DeliverableDetail> {
  const database = getDb();
  const deliverableRows = await database
    .select({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    })
    .from(deliverablesTable)
    .where(
      and(eq(deliverablesTable.id, deliverableId), eq(deliverablesTable.workspaceId, workspaceId)),
    )
    .limit(1);
  const deliverableRow = deliverableRows[0];

  if (!deliverableRow) {
    throw new Error('산출물을 찾을 수 없습니다.');
  }

  const nextStatus = status ?? deliverableRow.status;

  assertDeliverableStatusTransition(deliverableRow.status, nextStatus);

  const parsedDeliverable =
    markdown !== undefined
      ? parseDeliverableMarkdown({
          rawMarkdown: markdown,
          templateType: deliverableRow.templateType,
        })
      : null;

  if (markdown !== undefined && !parsedDeliverable) {
    throw new Error('산출물 Markdown 형식이 올바르지 않습니다.');
  }

  const shouldBumpVersion = title !== undefined || markdown !== undefined;
  const nextVersion = shouldBumpVersion ? deliverableRow.version + 1 : deliverableRow.version;

  const updatedRows = await database
    .update(deliverablesTable)
    .set({
      sections: parsedDeliverable?.sections ?? deliverableRow.sections,
      status: nextStatus,
      title: title ?? deliverableRow.title,
      updatedAt: sql`now()`,
      version: nextVersion,
    })
    .where(eq(deliverablesTable.id, deliverableId))
    .returning({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    });
  const updatedDeliverable = updatedRows[0];

  if (!updatedDeliverable) {
    throw new Error('산출물 수정에 실패했습니다.');
  }

  if (updatedDeliverable.status !== 'draft') {
    void safeReplaceMemoryChunksForDeliverable(updatedDeliverable.id);
  }

  return createDeliverableDetail({
    createdAt: updatedDeliverable.createdAt,
    id: updatedDeliverable.id,
    sections: updatedDeliverable.sections,
    sessionId: updatedDeliverable.sessionId,
    status: updatedDeliverable.status,
    templateType: updatedDeliverable.templateType,
    title: updatedDeliverable.title,
    updatedAt: updatedDeliverable.updatedAt,
    version: updatedDeliverable.version,
  });
}

async function convertDeliverableTone({
  deliverableId,
  tone,
  workspaceId,
}: {
  deliverableId: string;
  tone: DeliverableTone;
  workspaceId: string;
}): Promise<DeliverableDetail> {
  const database = getDb();
  const deliverableRows = await database
    .select({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    })
    .from(deliverablesTable)
    .where(
      and(eq(deliverablesTable.id, deliverableId), eq(deliverablesTable.workspaceId, workspaceId)),
    )
    .limit(1);

  const deliverableRow = deliverableRows[0];

  if (!deliverableRow) {
    throw new Error('산출물을 찾을 수 없습니다.');
  }

  const originalMarkdown = buildDeliverableMarkdown(deliverableRow.title, deliverableRow.sections);
  const toneLabel = TONE_LABELS[tone];
  const systemPrompt = TONE_SYSTEM_PROMPTS[tone];

  const conversionResult = await generateText({
    model: getChatModel(),
    prompt: originalMarkdown,
    system: systemPrompt,
    temperature: 0.3,
  });

  const parsedDeliverable = parseDeliverableMarkdown({
    rawMarkdown: conversionResult.text,
    templateType: deliverableRow.templateType,
  });

  if (!parsedDeliverable) {
    throw new Error('톤 변환 결과를 해석하지 못했습니다.');
  }

  const newTitle = `${deliverableRow.title} (${toneLabel})`;

  const createdDeliverables = await database
    .insert(deliverablesTable)
    .values({
      sections: parsedDeliverable.sections,
      sessionId: deliverableRow.sessionId,
      status: 'draft',
      templateType: deliverableRow.templateType,
      title: newTitle,
      version: 1,
      workspaceId,
    })
    .returning({
      createdAt: deliverablesTable.createdAt,
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      title: deliverablesTable.title,
      updatedAt: deliverablesTable.updatedAt,
      version: deliverablesTable.version,
    });

  const createdDeliverable = createdDeliverables[0];

  if (!createdDeliverable) {
    throw new Error('톤 변환 산출물 저장에 실패했습니다.');
  }

  return createDeliverableDetail({
    createdAt: createdDeliverable.createdAt,
    id: createdDeliverable.id,
    sections: createdDeliverable.sections,
    sessionId: createdDeliverable.sessionId,
    status: createdDeliverable.status,
    templateType: createdDeliverable.templateType,
    title: createdDeliverable.title,
    updatedAt: createdDeliverable.updatedAt,
    version: createdDeliverable.version,
  });
}

export {
  convertDeliverableTone,
  generateDeliverableForSession,
  getDeliverableDetailForWorkspace,
  getLatestDeliverableSummaryForSession,
  listDeliverablesByWorkspace,
  listRecentReferenceDeliverablesByTemplate,
  updateDeliverableForWorkspace,
};
