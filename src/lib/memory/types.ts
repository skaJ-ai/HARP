import type {
  DeliverableStatus,
  MemoryChunkKind,
  MemoryChunkStatus,
  SourceType,
  TemplateType,
} from '@/lib/db/schema';

interface MemoryChunkInput {
  content: string;
  contentHash: string;
  deliverableId: string | null;
  embedding: number[];
  embeddingModel: string;
  embeddingVersion: number;
  kind: MemoryChunkKind;
  sectionName: string | null;
  sessionId: string | null;
  sourceId: string | null;
  status: MemoryChunkStatus;
  templateType: TemplateType | null;
  workspaceId: string;
}

interface HybridRetrievalResult {
  content: string;
  deliverableId: string | null;
  id: string;
  kind: MemoryChunkKind;
  lexicalScore: number;
  score: number;
  sectionName: string | null;
  semanticScore: number;
  sessionId: string | null;
  sourceId: string | null;
  sourceType: SourceType | null;
  status: DeliverableStatus | null;
  templateType: TemplateType | null;
  title: string;
  updatedAt: string;
}

export type { HybridRetrievalResult, MemoryChunkInput };
