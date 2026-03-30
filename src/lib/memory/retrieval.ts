import { and, desc, eq, ne, sql } from 'drizzle-orm';

import { embedTexts, isEmbeddingConfigured } from '@/lib/ai/embedding';
import { getDb } from '@/lib/db';
import {
  deliverablesTable,
  memoryChunksTable,
  sourcesTable,
  type TemplateType,
} from '@/lib/db/schema';

import type { HybridRetrievalResult } from './types';

type RetrievalMode = 'generation' | 'workspace';

interface MemoryChunkRow {
  content: string;
  deliverableId: string | null;
  id: string;
  kind: 'deliverable_section' | 'source';
  sectionName: string | null;
  sessionId: string | null;
  sourceId: string | null;
  sourceType: 'data' | 'table' | 'text' | null;
  status: 'draft' | 'final' | 'promoted_asset' | null;
  templateType: TemplateType | null;
  title: string | null;
  updatedAt: Date;
}

interface SearchMemoryChunksHybridParams {
  currentSessionId?: string;
  limit: number;
  mode: RetrievalMode;
  query: string;
  templateType?: TemplateType;
  workspaceId: string;
}

const GENERATION_DELIVERABLE_KIND_BONUS = 0.1;
const GENERATION_TEMPLATE_MATCH_BONUS = 0.15;
const GENERATION_WEIGHTS = {
  lexical: 0.25,
  recency: 0.05,
  semantic: 0.55,
};
const LEXICAL_RESULT_LIMIT = 8;
const SEMANTIC_RESULT_LIMIT = 8;
const WORKSPACE_TEMPLATE_MATCH_BONUS = 0.05;
const WORKSPACE_WEIGHTS = {
  lexical: 0.55,
  recency: 0.05,
  semantic: 0.35,
};

function normalizeTextSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

function serializeEmbedding(vector: number[]): string {
  return JSON.stringify(vector);
}

function createBaseFilters({
  currentSessionId,
  mode,
  workspaceId,
}: {
  currentSessionId?: string;
  mode: RetrievalMode;
  workspaceId: string;
}) {
  const filters = [
    eq(memoryChunksTable.workspaceId, workspaceId),
    eq(memoryChunksTable.status, 'active'),
  ];

  if (mode === 'generation' && currentSessionId) {
    filters.push(ne(memoryChunksTable.sessionId, currentSessionId));
  }

  return filters;
}

function buildMemoryChunkSelect() {
  return {
    content: memoryChunksTable.content,
    deliverableId: memoryChunksTable.deliverableId,
    id: memoryChunksTable.id,
    kind: memoryChunksTable.kind,
    sectionName: memoryChunksTable.sectionName,
    sessionId: memoryChunksTable.sessionId,
    sourceId: memoryChunksTable.sourceId,
    sourceType: sourcesTable.type,
    status: deliverablesTable.status,
    templateType: memoryChunksTable.templateType,
    title: sql<
      string | null
    >`coalesce(${deliverablesTable.title}, ${sourcesTable.label}, '세션 근거자료')`,
    updatedAt: sql<Date>`coalesce(${deliverablesTable.updatedAt}, ${sourcesTable.createdAt}, ${memoryChunksTable.updatedAt})`,
  };
}

function normalizeScores(values: number[]): Map<number, number> {
  const uniqueValues = [...new Set(values)];

  if (uniqueValues.length === 0) {
    return new Map();
  }

  const minScore = Math.min(...uniqueValues);
  const maxScore = Math.max(...uniqueValues);

  if (maxScore === minScore) {
    return new Map(uniqueValues.map((value) => [value, 1]));
  }

  return new Map(uniqueValues.map((value) => [value, (value - minScore) / (maxScore - minScore)]));
}

function calculateRecencyScore(values: HybridRetrievalResult[]): Map<string, number> {
  const sortedValues = [...values].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
  const scoreMap = new Map<string, number>();

  if (sortedValues.length === 1) {
    const singleValue = sortedValues[0];

    if (singleValue) {
      scoreMap.set(singleValueKey(singleValue), 1);
    }

    return scoreMap;
  }

  sortedValues.forEach((value, index) => {
    const denominator = Math.max(sortedValues.length - 1, 1);
    const recencyScore = 1 - index / denominator;

    scoreMap.set(singleValueKey(value), recencyScore);
  });

  return scoreMap;
}

function singleValueKey(
  value: Pick<HybridRetrievalResult, 'deliverableId' | 'id' | 'kind' | 'sectionName' | 'sourceId'>,
): string {
  if (value.kind === 'source') {
    return value.sourceId ?? value.id;
  }

  return `${value.deliverableId ?? value.id}:${value.sectionName ?? ''}`;
}

function createHybridResult(row: MemoryChunkRow): HybridRetrievalResult {
  return {
    content: row.content,
    deliverableId: row.deliverableId,
    id: row.id,
    kind: row.kind,
    lexicalScore: 0,
    score: 0,
    sectionName: row.sectionName,
    semanticScore: 0,
    sessionId: row.sessionId,
    sourceId: row.sourceId,
    sourceType: row.sourceType,
    status: row.status,
    templateType: row.templateType,
    title: row.title ?? '세션 근거자료',
    updatedAt: row.updatedAt.toISOString(),
  };
}

function applyLexicalScores(
  resultMap: Map<string, HybridRetrievalResult>,
  lexicalRows: (MemoryChunkRow & { lexicalScore: number })[],
): void {
  const normalizationMap = normalizeScores(lexicalRows.map((row) => Number(row.lexicalScore)));

  for (const row of lexicalRows) {
    const existing = resultMap.get(row.id) ?? createHybridResult(row);

    existing.lexicalScore = normalizationMap.get(Number(row.lexicalScore)) ?? 0;
    resultMap.set(row.id, existing);
  }
}

function applySemanticScores(
  resultMap: Map<string, HybridRetrievalResult>,
  semanticRows: (MemoryChunkRow & { semanticScore: number })[],
): void {
  const normalizationMap = normalizeScores(semanticRows.map((row) => Number(row.semanticScore)));

  for (const row of semanticRows) {
    const existing = resultMap.get(row.id) ?? createHybridResult(row);

    existing.semanticScore = normalizationMap.get(Number(row.semanticScore)) ?? 0;
    resultMap.set(row.id, existing);
  }
}

function computeHybridScore({
  mode,
  recencyScore,
  result,
  templateType,
}: {
  mode: RetrievalMode;
  recencyScore: number;
  result: HybridRetrievalResult;
  templateType?: TemplateType;
}): number {
  if (mode === 'generation') {
    return (
      result.lexicalScore * GENERATION_WEIGHTS.lexical +
      result.semanticScore * GENERATION_WEIGHTS.semantic +
      recencyScore * GENERATION_WEIGHTS.recency +
      (templateType && result.templateType === templateType ? GENERATION_TEMPLATE_MATCH_BONUS : 0) +
      (result.kind === 'deliverable_section' ? GENERATION_DELIVERABLE_KIND_BONUS : 0)
    );
  }

  return (
    result.lexicalScore * WORKSPACE_WEIGHTS.lexical +
    result.semanticScore * WORKSPACE_WEIGHTS.semantic +
    recencyScore * WORKSPACE_WEIGHTS.recency +
    (templateType && result.templateType === templateType ? WORKSPACE_TEMPLATE_MATCH_BONUS : 0)
  );
}

async function fetchLexicalRows({
  filters,
  normalizedQuery,
}: {
  filters: ReturnType<typeof createBaseFilters>;
  normalizedQuery: string;
}): Promise<(MemoryChunkRow & { lexicalScore: number })[]> {
  const database = getDb();
  const memoryVector = sql`to_tsvector('simple', ${memoryChunksTable.content})`;
  const tsQuery = sql`plainto_tsquery('simple', ${normalizedQuery})`;
  const lexicalScore = sql<number>`ts_rank_cd(${memoryVector}, ${tsQuery})`;

  return database
    .select({
      ...buildMemoryChunkSelect(),
      lexicalScore,
    })
    .from(memoryChunksTable)
    .leftJoin(deliverablesTable, eq(memoryChunksTable.deliverableId, deliverablesTable.id))
    .leftJoin(sourcesTable, eq(memoryChunksTable.sourceId, sourcesTable.id))
    .where(and(...filters, sql`${memoryVector} @@ ${tsQuery}`))
    .orderBy(sql`${lexicalScore} desc`, desc(memoryChunksTable.updatedAt))
    .limit(LEXICAL_RESULT_LIMIT);
}

async function fetchSemanticRows({
  filters,
  normalizedQuery,
}: {
  filters: ReturnType<typeof createBaseFilters>;
  normalizedQuery: string;
}): Promise<(MemoryChunkRow & { semanticScore: number })[]> {
  if (!isEmbeddingConfigured()) {
    return [];
  }

  const [queryEmbedding] = await embedTexts([normalizedQuery]);

  if (!queryEmbedding) {
    return [];
  }

  const database = getDb();
  const serializedEmbedding = serializeEmbedding(queryEmbedding);
  const semanticScore = sql<number>`1 - (${memoryChunksTable.embedding} <=> ${serializedEmbedding}::vector)`;

  return database
    .select({
      ...buildMemoryChunkSelect(),
      semanticScore,
    })
    .from(memoryChunksTable)
    .leftJoin(deliverablesTable, eq(memoryChunksTable.deliverableId, deliverablesTable.id))
    .leftJoin(sourcesTable, eq(memoryChunksTable.sourceId, sourcesTable.id))
    .where(and(...filters))
    .orderBy(sql`${semanticScore} desc`, desc(memoryChunksTable.updatedAt))
    .limit(SEMANTIC_RESULT_LIMIT);
}

async function searchMemoryChunksHybrid({
  currentSessionId,
  limit,
  mode,
  query,
  templateType,
  workspaceId,
}: SearchMemoryChunksHybridParams): Promise<HybridRetrievalResult[]> {
  const normalizedQuery = normalizeTextSearchQuery(query);

  if (normalizedQuery.length === 0) {
    return [];
  }

  const filters = createBaseFilters({
    currentSessionId,
    mode,
    workspaceId,
  });
  const [lexicalRows, semanticRows] = await Promise.all([
    fetchLexicalRows({ filters, normalizedQuery }),
    fetchSemanticRows({ filters, normalizedQuery }),
  ]);
  const resultMap = new Map<string, HybridRetrievalResult>();

  applyLexicalScores(resultMap, lexicalRows);
  applySemanticScores(resultMap, semanticRows);

  const results = [...resultMap.values()];
  const recencyScoreMap = calculateRecencyScore(results);

  for (const result of results) {
    const recencyScore = recencyScoreMap.get(singleValueKey(result)) ?? 0;

    result.score = computeHybridScore({
      mode,
      recencyScore,
      result,
      templateType,
    });
  }

  return results.sort((left, right) => right.score - left.score).slice(0, limit);
}

export { searchMemoryChunksHybrid };
