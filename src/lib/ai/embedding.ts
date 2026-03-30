interface EmbeddingConfig {
  apiUrl: string;
  dimension: number | null;
  model: string;
  version: number;
}

interface OllamaEmbedResponse {
  embedding?: unknown;
  embeddings?: unknown;
}

const DEFAULT_EMBEDDING_VERSION = 1;
const DEFAULT_EMBEDDING_TIMEOUT_MS = 8000;

function parseEmbeddingDimension(): number | null {
  const rawDimension = process.env.EMBEDDING_DIM?.trim();

  if (!rawDimension) {
    return null;
  }

  const parsedDimension = Number.parseInt(rawDimension, 10);

  if (!Number.isFinite(parsedDimension) || parsedDimension <= 0) {
    throw new Error('EMBEDDING_DIM must be a positive integer when configured.');
  }

  return parsedDimension;
}

function parseEmbeddingVersion(): number {
  const rawVersion = process.env.EMBEDDING_VERSION?.trim();

  if (!rawVersion) {
    return DEFAULT_EMBEDDING_VERSION;
  }

  const parsedVersion = Number.parseInt(rawVersion, 10);

  if (!Number.isFinite(parsedVersion) || parsedVersion <= 0) {
    throw new Error('EMBEDDING_VERSION must be a positive integer when configured.');
  }

  return parsedVersion;
}

function getEmbeddingRequestTimeoutMs(): number {
  const rawTimeout = process.env.EMBEDDING_TIMEOUT_MS?.trim();

  if (!rawTimeout) {
    return DEFAULT_EMBEDDING_TIMEOUT_MS;
  }

  const parsedTimeout = Number.parseInt(rawTimeout, 10);

  if (!Number.isFinite(parsedTimeout) || parsedTimeout <= 0) {
    throw new Error('EMBEDDING_TIMEOUT_MS must be a positive integer when configured.');
  }

  return parsedTimeout;
}

function buildOllamaUrl(apiUrl: string, path: string): string {
  return `${apiUrl.replace(/\/+$/, '')}${path}`;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function parseEmbeddingsFromResponse(responseData: OllamaEmbedResponse): number[][] | null {
  if (
    Array.isArray(responseData.embeddings) &&
    responseData.embeddings.every((value) => isNumberArray(value))
  ) {
    return responseData.embeddings;
  }

  if (isNumberArray(responseData.embedding)) {
    return [responseData.embedding];
  }

  return null;
}

async function parseOllamaResponse(response: Response): Promise<number[][]> {
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Embedding request failed with status ${response.status}: ${errorText || response.statusText}`,
    );
  }

  const responseData = (await response.json()) as OllamaEmbedResponse;
  const embeddings = parseEmbeddingsFromResponse(responseData);

  if (!embeddings) {
    throw new Error('Embedding response payload is invalid.');
  }

  return embeddings;
}

function getEmbeddingConfig(): EmbeddingConfig {
  const apiUrl = process.env.EMBEDDING_API_URL?.trim();
  const model = process.env.EMBEDDING_MODEL?.trim();

  if (!apiUrl) {
    throw new Error('EMBEDDING_API_URL is not configured.');
  }

  if (!model) {
    throw new Error('EMBEDDING_MODEL is not configured.');
  }

  return {
    apiUrl,
    dimension: parseEmbeddingDimension(),
    model,
    version: parseEmbeddingVersion(),
  };
}

function isEmbeddingConfigured(): boolean {
  return Boolean(process.env.EMBEDDING_API_URL?.trim() && process.env.EMBEDDING_MODEL?.trim());
}

async function requestEmbeddingsWithEmbedEndpoint(
  config: EmbeddingConfig,
  texts: string[],
): Promise<number[][]> {
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => abortController.abort(), getEmbeddingRequestTimeoutMs());
  const requestBody: { dimensions?: number; input: string[]; model: string } = {
    input: texts,
    model: config.model,
  };

  if (config.dimension !== null) {
    requestBody.dimensions = config.dimension;
  }

  try {
    const response = await fetch(buildOllamaUrl(config.apiUrl, '/api/embed'), {
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: abortController.signal,
    });

    return await parseOllamaResponse(response);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function requestEmbeddingsWithLegacyEndpoint(
  config: EmbeddingConfig,
  texts: string[],
): Promise<number[][]> {
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => abortController.abort(), getEmbeddingRequestTimeoutMs());

  try {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const response = await fetch(buildOllamaUrl(config.apiUrl, '/api/embeddings'), {
        body: JSON.stringify({
          model: config.model,
          prompt: text,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: abortController.signal,
      });
      const [embedding] = await parseOllamaResponse(response);

      if (!embedding) {
        throw new Error('Legacy embedding endpoint returned an empty vector.');
      }

      embeddings.push(embedding);
    }

    return embeddings;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function validateEmbeddingDimensions(
  embeddings: number[][],
  expectedDimension: number | null,
): void {
  if (embeddings.length === 0) {
    return;
  }

  const firstDimension = embeddings[0]?.length ?? 0;

  if (firstDimension === 0) {
    throw new Error('Embedding vector is empty.');
  }

  if (expectedDimension !== null && firstDimension !== expectedDimension) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${expectedDimension}, received ${firstDimension}.`,
    );
  }

  if (!embeddings.every((embedding) => embedding.length === firstDimension)) {
    throw new Error('Embedding vectors must all have the same dimension.');
  }
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const config = getEmbeddingConfig();

  try {
    const embeddings = await requestEmbeddingsWithEmbedEndpoint(config, texts);

    validateEmbeddingDimensions(embeddings, config.dimension);

    return embeddings;
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    if (
      error.message.includes('Embedding response payload is invalid.') ||
      error.message.includes('404')
    ) {
      const embeddings = await requestEmbeddingsWithLegacyEndpoint(config, texts);

      validateEmbeddingDimensions(embeddings, config.dimension);

      return embeddings;
    }

    throw error;
  }
}

export { embedTexts, getEmbeddingConfig, isEmbeddingConfigured };
