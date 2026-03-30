import { z } from 'zod';

const EXAMPLE_TEXT_MAX_LENGTH = 5000;

const createSessionRequestSchema = z.object({
  exampleText: z
    .string()
    .trim()
    .max(EXAMPLE_TEXT_MAX_LENGTH, `예시 문서는 ${EXAMPLE_TEXT_MAX_LENGTH}자 이내로 입력해 주세요.`)
    .optional(),
  templateType: z.enum(['analysis', 'planning', 'result', 'status']),
});

const createSourceRequestSchema = z.object({
  content: z.string().trim().min(1, '근거자료 내용을 입력해 주세요.'),
  label: z.string().trim().optional(),
  type: z.enum(['text', 'table', 'data']).optional(),
});

export { EXAMPLE_TEXT_MAX_LENGTH, createSessionRequestSchema, createSourceRequestSchema };
