import { z } from 'zod';

import { 
  MAX_PROMPT_LENGTH, 
  MAX_TITLE_LENGTH, 
  MAX_DESCRIPTION_LENGTH,
  PROMPT_VISIBILITY,
  PROMPT_STATUS 
} from '../constants';

// Input sanitization function
const sanitizeString = (str: string): string => {
  return str
    // eslint-disable-next-line no-control-regex
    .replace(/[<>"'&\u0000-\u001F\u007F]/g, '') // Remove potentially dangerous characters
    .trim()
    .normalize('NFC'); // Unicode normalization
};


export const PromptSchema = z.object({
  id: z.string().regex(/^prm_[a-zA-Z0-9]+$/, 'Invalid prompt ID format'),
  title: z.string().nullish()
    .refine((str) => {
      if (!str || typeof str !== 'string') return true; // null/undefined is allowed
      const trimmed = str.trim();
      return trimmed.length === 0 || trimmed.length <= MAX_TITLE_LENGTH;
    }, `Title must be ${MAX_TITLE_LENGTH} characters or less`)
    .transform((str) => {
      if (!str || typeof str !== 'string') return null;
      const trimmed = str.trim();
      if (trimmed.length === 0) return null;
      return sanitizeString(trimmed);
    }),
  content: z.string().min(1, 'Content is required').max(MAX_PROMPT_LENGTH, `Content must be ${MAX_PROMPT_LENGTH} characters or less`).transform((str) => {
    return str
      // eslint-disable-next-line no-control-regex
      .replace(/[<>"'&\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .normalize('NFC');
  }),
  description: z.string().max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`).optional().transform((str) => str ? sanitizeString(str) : str),
  quickAccessKey: z.string().regex(/^[a-zA-Z0-9]+$/, 'Quick access key must be alphanumeric').min(2, 'Quick access key must be at least 2 characters').max(20, 'Quick access key must be 20 characters or less').optional().transform((str) => str ? sanitizeString(str) : str),
  workspaceId: z.string().regex(/^wsp_[a-zA-Z0-9]+$/, 'Invalid workspace ID format'),
  tagIds: z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid tag format')).max(20, 'Maximum 20 tags allowed').default([]),
  visibility: z.enum([PROMPT_VISIBILITY.PRIVATE, PROMPT_VISIBILITY.PUBLIC, PROMPT_VISIBILITY.SHARED])
    .default(PROMPT_VISIBILITY.PRIVATE),
  status: z.enum([PROMPT_STATUS.DRAFT, PROMPT_STATUS.ACTIVE, PROMPT_STATUS.ARCHIVED])
    .default(PROMPT_STATUS.ACTIVE),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastUsedAt: z.date().optional(),
  usageCount: z.number().int().min(0).max(1000000, 'Usage count too high').default(0),
  metadata: z.record(z.unknown()).optional().refine(
    (metadata) => {
      if (!metadata) return true;
      const str = JSON.stringify(metadata);
      return str.length <= 10000; // Limit metadata size
    },
    'Metadata too large'
  ),
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