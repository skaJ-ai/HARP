import { createHash } from 'node:crypto';

import { and, eq, sql } from 'drizzle-orm';

import { embedTexts, getEmbeddingConfig, isEmbeddingConfigured } from '@/lib/ai/embedding';
import { getDb } from '@/lib/db';
import type { DeliverableSection } from '@/lib/db/schema';
import { deliverablesTable, memoryChunksTable, sessionsTable, sourcesTable } from '@/lib/db/schema';

import type { MemoryChunkInput } from './types';

const MAX_SOURCE_CHUNK_LENGTH = 1200;
const SOURCE_CHUNK_FALLBACK_LENGTH = 900;

function createContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function normalizeChunkContent(content: string): string {
  return content.trim();
}

function splitSourceContentIntoChunks(content: string): string[] {
  const normalizedContent = normalizeChunkContent(content);

  if (normalizedContent.length === 0) {
    return [];
  }

  if (normalizedContent.length <= MAX_SOURCE_CHUNK_LENGTH) {
    return [normalizedContent];
  }

  const paragraphs = normalizedContent
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  if (paragraphs.length === 0) {
    return chunkContentByLength(normalizedContent, SOURCE_CHUNK_FALLBACK_LENGTH);
  }

  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const nextChunk = currentChunk.length === 0 ? paragraph : `${currentChunk}\n\n${paragraph}`;

    if (nextChunk.length <= MAX_SOURCE_CHUNK_LENGTH) {
      currentChunk = nextChunk;
      continue;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }

    if (paragraph.length <= MAX_SOURCE_CHUNK_LENGTH) {
      currentChunk = paragraph;
      continue;
    }

    chunks.push(...chunkContentByLength(paragraph, SOURCE_CHUNK_FALLBACK_LENGTH));
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function chunkContentByLength(content: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    chunks.push(content.slice(cursor, cursor + maxLength).trim());
    cursor += maxLength;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

function buildDeliverableEmbeddingInput(section: DeliverableSection): string {
  return `${section.name}\n${normalizeChunkContent(section.content)}`.trim();
}

async function replaceMemoryChunksForSource(sourceId: string): Promise<boolean> {
  if (!isEmbeddingConfigured()) {
    return false;
  }

  const database = getDb();
  const sourceRows = await database
    .select({
      content: sourcesTable.content,
      id: sourcesTable.id,
      sessionId: sourcesTable.sessionId,
      templateType: sessionsTable.templateType,
      workspaceId: sessionsTable.workspaceId,
    })
    .from(sourcesTable)
    .innerJoin(sessionsTable, eq(sourcesTable.sessionId, sessionsTable.id))
    .where(eq(sourcesTable.id, sourceId))
    .limit(1);
  const sourceRow = sourceRows[0];

  if (!sourceRow) {
    return false;
  }

  const chunkContents = splitSourceContentIntoChunks(sourceRow.content);

  if (chunkContents.length === 0) {
    await markSourceMemoryChunksSuperseded(sourceId);
    return true;
  }

  const embeddingConfig = getEmbeddingConfig();
  const embeddings = await embedTexts(chunkContents);
  const inputs: MemoryChunkInput[] = chunkContents.map((content, index) => ({
    content,
    contentHash: createContentHash(content),
    deliverableId: null,
    embedding: embeddings[index] ?? [],
    embeddingModel: embeddingConfig.model,
    embeddingVersion: embeddingConfig.version,
    kind: 'source',
    sectionName: null,
    sessionId: sourceRow.sessionId,
    sourceId: sourceRow.id,
    status: 'active',
    templateType: sourceRow.templateType,
    workspaceId: sourceRow.workspaceId,
  }));

  await database.transaction(async (transaction) => {
    await transaction
      .update(memoryChunksTable)
      .set({
        status: 'superseded',
        updatedAt: sql`now()`,
      })
      .where(and(eq(memoryChunksTable.sourceId, sourceId), eq(memoryChunksTable.status, 'active')));

    await transaction.insert(memoryChunksTable).values(inputs);
  });

  return true;
}

async function markSourceMemoryChunksSuperseded(sourceId: string): Promise<void> {
  const database = getDb();

  await database
    .update(memoryChunksTable)
    .set({
      status: 'superseded',
      updatedAt: sql`now()`,
    })
    .where(and(eq(memoryChunksTable.sourceId, sourceId), eq(memoryChunksTable.status, 'active')));
}

async function replaceMemoryChunksForDeliverable(deliverableId: string): Promise<boolean> {
  if (!isEmbeddingConfigured()) {
    return false;
  }

  const database = getDb();
  const deliverableRows = await database
    .select({
      id: deliverablesTable.id,
      sections: deliverablesTable.sections,
      sessionId: deliverablesTable.sessionId,
      status: deliverablesTable.status,
      templateType: deliverablesTable.templateType,
      workspaceId: deliverablesTable.workspaceId,
    })
    .from(deliverablesTable)
    .where(eq(deliverablesTable.id, deliverableId))
    .limit(1);
  const deliverableRow = deliverableRows[0];

  if (!deliverableRow) {
    return false;
  }

  if (deliverableRow.status === 'draft') {
    await markDeliverableMemoryChunksSuperseded(deliverableId);
    return true;
  }

  const activeSections = deliverableRow.sections.filter(
    (section) => normalizeChunkContent(section.content).length > 0,
  );

  if (activeSections.length === 0) {
    await markDeliverableMemoryChunksSuperseded(deliverableId);
    return true;
  }

  const embeddingInputs = activeSections.map(buildDeliverableEmbeddingInput);
  const embeddingConfig = getEmbeddingConfig();
  const embeddings = await embedTexts(embeddingInputs);
  const inputs: MemoryChunkInput[] = activeSections.map((section, index) => ({
    content: normalizeChunkContent(section.content),
    contentHash: createContentHash(`${section.name}\n${normalizeChunkContent(section.content)}`),
    deliverableId: deliverableRow.id,
    embedding: embeddings[index] ?? [],
    embeddingModel: embeddingConfig.model,
    embeddingVersion: embeddingConfig.version,
    kind: 'deliverable_section',
    sectionName: section.name,
    sessionId: deliverableRow.sessionId,
    sourceId: null,
    status: 'active',
    templateType: deliverableRow.templateType,
    workspaceId: deliverableRow.workspaceId,
  }));

  await database.transaction(async (transaction) => {
    await transaction
      .update(memoryChunksTable)
      .set({
        status: 'superseded',
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(memoryChunksTable.deliverableId, deliverableId),
          eq(memoryChunksTable.status, 'active'),
        ),
      );

    await transaction.insert(memoryChunksTable).values(inputs);
  });

  return true;
}

async function markDeliverableMemoryChunksSuperseded(deliverableId: string): Promise<void> {
  const database = getDb();

  await database
    .update(memoryChunksTable)
    .set({
      status: 'superseded',
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(memoryChunksTable.deliverableId, deliverableId),
        eq(memoryChunksTable.status, 'active'),
      ),
    );
}

async function safeReplaceMemoryChunksForSource(sourceId: string): Promise<void> {
  try {
    await replaceMemoryChunksForSource(sourceId);
  } catch (error) {
    console.error('Failed to sync source memory chunks.', { error, sourceId });
  }
}

async function safeReplaceMemoryChunksForDeliverable(deliverableId: string): Promise<void> {
  try {
    await replaceMemoryChunksForDeliverable(deliverableId);
  } catch (error) {
    console.error('Failed to sync deliverable memory chunks.', { deliverableId, error });
  }
}

export {
  createContentHash,
  replaceMemoryChunksForDeliverable,
  replaceMemoryChunksForSource,
  safeReplaceMemoryChunksForDeliverable,
  safeReplaceMemoryChunksForSource,
};
