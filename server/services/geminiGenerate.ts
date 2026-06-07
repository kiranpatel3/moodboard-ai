import type { GenerateContentParameters } from '@google/genai';
import { gemini } from '../geminiClient.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const FALLBACK_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash-lite'];

export type GenerateGeminiContentParams = Omit<GenerateContentParameters, 'model'> & {
  model?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function isGeminiCapacityError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 429 || status === 503) {
    return true;
  }

  const message = getErrorMessage(error);
  return (
    message.includes('high demand') ||
    message.includes('UNAVAILABLE') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('overloaded')
  );
}

function isRetryableGeminiError(error: unknown): boolean {
  return isGeminiCapacityError(error);
}

export async function generateGeminiContent(
  params: GenerateGeminiContentParams,
): Promise<Awaited<ReturnType<typeof gemini.models.generateContent>>> {
  const primaryModel = params.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const models = [
    primaryModel,
    ...FALLBACK_GEMINI_MODELS.filter((model) => model !== primaryModel),
  ];

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await gemini.models.generateContent({
          ...params,
          model,
        });
      } catch (error) {
        lastError = error;

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        if (attempt < 2) {
          await sleep(1000 * 2 ** attempt);
        }
      }
    }
  }

  throw lastError;
}
