import { and, desc, eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { deliverablesTable, sessionsTable, sourcesTable } from '@/lib/db/schema';
import { searchMemoryChunksHybrid } from '@/lib/memory/retrieval';

import type { WorkspaceSearchResult } from './types';

function buildSearchSnippet(content: string, query: string): string {
  const normalizedContent = content.trim().replace(/\s+/g, ' ');
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedContent.length === 0) {
    return '요약 없음';
  }

  const matchIndex = normalizedContent.toLowerCase().indexOf(normalizedQuery);

  if (matchIndex < 0) {
    return normalizedContent.slice(0, 180);
  }

  const snippetStart = Math.max(0, matchIndex - 60);
  const snippetEnd = Math.min(normalizedContent.length, matchIndex + normalizedQuery.length + 120);
  const prefix = snippetStart > 0 ? '... ' : '';
  const suffix = snippetEnd < normalizedContent.length ? ' ...' : '';

  return `${prefix}${normalizedContent.slice(snippetStart, snippetEnd)}${suffix}`;
}

function compareSearchResults(left: WorkspaceSearchResult, right: WorkspaceSearchResult): number {
  if (right.rank !== left.rank) {
    return right.rank - left.rank;
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

function createSearchResultKey(result: WorkspaceSearchResult): string {
  return `${result.kind}:${result.id}`;
}

function mergeSearchResults(
  primaryResults: WorkspaceSearchResult[],
  secondaryResults: WorkspaceSearchResult[],
): WorkspaceSearchResult[] {
  const resultMap = new Map<string, WorkspaceSearchResult>();

  for (const result of [...primaryResults, ...secondaryResults]) {
    const key = createSearchResultKey(result);
    const existing = resultMap.get(key);

    if (!existing || result.rank > existing.rank) {
      resultMap.set(key, result);
    }
  }

  return [...resultMap.values()].sort(compareSearchResults);
}

function materializeMemorySearchResults(
  results: Awaited<ReturnType<typeof searchMemoryChunksHybrid>>,
  query: string,
): WorkspaceSearchResult[] {
  const entityMap = new Map<string, WorkspaceSearchResult>();

  for (const result of results) {
    if (result.kind === 'source') {
      if (!result.sourceId || !result.sessionId) {
        continue;
      }

      const key = `source:${result.sourceId}`;
      const nextResult: WorkspaceSearchResult = {
        href: `/workspace/session/${result.sessionId}`,
        id: result.sourceId,
        kind: 'source',
        rank: result.score,
        snippet: buildSearchSnippet(result.content, query),
        sourceType: result.sourceType,
        title: result.title,
        updatedAt: result.updatedAt,
      };
      const existing = entityMap.get(key);

      if (!existing || nextResult.rank > existing.rank) {
        entityMap.set(key, nextResult);
      }

      continue;
    }

    if (!result.deliverableId) {
      continue;
    }

    const key = `deliverable:${result.deliverableId}`;
    const snippetSource = result.sectionName
      ? `${result.sectionName} ${result.content}`
      : result.content;
    const nextResult: WorkspaceSearchResult = {
      href: `/workspace/asset/${result.deliverableId}`,
      id: result.deliverableId,
      kind: 'deliverable',
      rank: result.score,
      snippet: buildSearchSnippet(snippetSource, query),
      status: result.status ?? undefined,
      templateType: result.templateType ?? undefined,
      title: result.title,
      updatedAt: result.updatedAt,
    };
    const existing = entityMap.get(key);

    if (!existing || nextResult.rank > existing.rank) {
      entityMap.set(key, nextResult);
    }
  }

  return [...entityMap.values()];
}

async function searchWorkspaceContentLegacy({
  query,
  workspaceId,
}: {
  query: string;
  workspaceId: string;
}): Promise<WorkspaceSearchResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const database = getDb();
  const deliverableVector = sql`to_tsvector('simple', ${deliverablesTable.title} || ' ' || ${deliverablesTable.sections}::text)`;
  const sourceVector = sql`to_tsvector('simple', ${sourcesTable.content})`;
  const tsQuery = sql`plainto_tsquery('simple', ${normalizedQuery})`;
  const deliverableRank = sql<number>`ts_rank_cd(${deliverableVector}, ${tsQuery})`;
  const sourceRank = sql<number>`ts_rank_cd(${sourceVector}, ${tsQuery})`;
  const [deliverableRows, sourceRows] = await Promise.all([
    database
      .select({
        id: deliverablesTable.id,
        rank: deliverableRank,
        sections: deliverablesTable.sections,
        status: deliverablesTable.status,
        templateType: deliverablesTable.templateType,
        title: deliverablesTable.title,
        updatedAt: deliverablesTable.updatedAt,
      })
      .from(deliverablesTable)
      .where(
        and(
          eq(deliverablesTable.workspaceId, workspaceId),
          sql`${deliverableVector} @@ ${tsQuery}`,
        ),
      )
      .orderBy(sql`${deliverableRank} desc`, desc(deliverablesTable.updatedAt))
      .limit(8),
    database
      .select({
        content: sourcesTable.content,
        id: sourcesTable.id,
        label: sourcesTable.label,
        rank: sourceRank,
        sessionId: sourcesTable.sessionId,
        sourceType: sourcesTable.type,
        updatedAt: sourcesTable.createdAt,
      })
      .from(sourcesTable)
      .innerJoin(sessionsTable, eq(sourcesTable.sessionId, sessionsTable.id))
      .where(and(eq(sessionsTable.workspaceId, workspaceId), sql`${sourceVector} @@ ${tsQuery}`))
      .orderBy(sql`${sourceRank} desc`, desc(sourcesTable.createdAt))
      .limit(8),
  ]);

  const deliverableResults: WorkspaceSearchResult[] = deliverableRows.map((deliverableRow) => {
    const joinedSectionContent = deliverableRow.sections
      .map((section) => `${section.name} ${section.content}`)
      .join(' ');

    return {
      href: `/workspace/asset/${deliverableRow.id}`,
      id: deliverableRow.id,
      kind: 'deliverable',
      rank: Number(deliverableRow.rank),
      snippet: buildSearchSnippet(joinedSectionContent, normalizedQuery),
      status: deliverableRow.status,
      templateType: deliverableRow.templateType,
      title: deliverableRow.title,
      updatedAt: deliverableRow.updatedAt.toISOString(),
    };
  });
  const sourceResults: WorkspaceSearchResult[] = sourceRows.map((sourceRow, index) => ({
    href: `/workspace/session/${sourceRow.sessionId}`,
    id: sourceRow.id,
    kind: 'source',
    rank: Number(sourceRow.rank) - index * 0.0001,
    snippet: buildSearchSnippet(sourceRow.content, normalizedQuery),
    sourceType: sourceRow.sourceType,
    title: sourceRow.label ?? '세션 근거자료',
    updatedAt: sourceRow.updatedAt.toISOString(),
  }));

  return [...deliverableResults, ...sourceResults].sort(compareSearchResults);
}

async function searchWorkspaceContent({
  query,
  workspaceId,
}: {
  query: string;
  workspaceId: string;
}): Promise<WorkspaceSearchResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const legacyResults = await searchWorkspaceContentLegacy({
    query: normalizedQuery,
    workspaceId,
  });
  const memoryResults = await searchMemoryChunksHybrid({
    limit: 8,
    mode: 'workspace',
    query: normalizedQuery,
    workspaceId,
  })
    .then((results) => materializeMemorySearchResults(results, normalizedQuery))
    .catch((error) => {
      console.error('Failed to execute hybrid workspace search.', {
        error,
        query: normalizedQuery,
        workspaceId,
      });

      return [];
    });

  return mergeSearchResults(memoryResults, legacyResults);
}

export { searchWorkspaceContent };
