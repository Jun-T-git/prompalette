import { z } from 'zod';

import { 
  MAX_PROMPT_LENGTH, 
  MAX_TITLE_LENGTH, 
  MAX_DESCRIPTION_LENGTH,
  PROMPT_VISIBILITY,
  PROMPT_STATUS 
} from '../constants';

export const PromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  content: z.string().min(1).max(MAX_PROMPT_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  workspaceId: z.string(),
  tagIds: z.array(z.string()).default([]),
  visibility: z.enum([PROMPT_VISIBILITY.PRIVATE, PROMPT_VISIBILITY.PUBLIC, PROMPT_VISIBILITY.SHARED])
    .default(PROMPT_VISIBILITY.PRIVATE),
  status: z.enum([PROMPT_STATUS.DRAFT, PROMPT_STATUS.ACTIVE, PROMPT_STATUS.ARCHIVED])
    .default(PROMPT_STATUS.ACTIVE),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastUsedAt: z.date().optional(),
  usageCount: z.number().int().min(0).default(0),
  metadata: z.record(z.unknown()).optional(),
});

export type Prompt = z.infer<typeof PromptSchema>;

export const CreatePromptSchema = PromptSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
  usageCount: true,
});

export type CreatePrompt = z.infer<typeof CreatePromptSchema>;

export const UpdatePromptSchema = CreatePromptSchema.partial();

export type UpdatePrompt = z.infer<typeof UpdatePromptSchema>;