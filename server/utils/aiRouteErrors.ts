import type { Response } from 'express';
import { isGeminiCapacityError } from '../services/geminiGenerate.js';

interface HandleAiRouteErrorOptions {
  logPrefix: string;
  invalidFormatMessage: string;
  failureMessage: string;
}

export function handleAiRouteError(
  res: Response,
  error: unknown,
  {
    logPrefix,
    invalidFormatMessage,
    failureMessage,
  }: HandleAiRouteErrorOptions,
): void {
  const message = error instanceof Error ? error.message : 'Unknown generation error';

  if (message.includes('GEMINI_API_KEY is not configured')) {
    res.status(503).json({
      error: 'AI generation service is unavailable. Configure GEMINI_API_KEY.',
      code: 'AI_SERVICE_UNAVAILABLE',
    });
    return;
  }

  if (isGeminiCapacityError(error)) {
    console.error(`[${logPrefix}] capacity error:`, error);
    res.status(503).json({
      error: 'The AI service is temporarily busy. Please try again in a moment.',
      code: 'AI_SERVICE_BUSY',
    });
    return;
  }

  if (
    message.includes('could not be parsed') ||
    message.includes('AI response missing') ||
    message.includes('AI response contained') ||
    message.includes('invalid')
  ) {
    console.error(`[${logPrefix}] parse error:`, message);
    res.status(502).json({
      error: invalidFormatMessage,
      code: 'AI_RESPONSE_INVALID',
    });
    return;
  }

  console.error(`[${logPrefix}]`, error);
  res.status(502).json({
    error: failureMessage,
    code: 'AI_GENERATION_FAILED',
  });
}
