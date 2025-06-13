import { z } from 'zod';

import { MAX_TAG_LENGTH } from '../constants';

export const TagSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_TAG_LENGTH),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

export const CreateTagSchema = TagSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTag = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = CreateTagSchema.partial();

export type UpdateTag = z.infer<typeof UpdateTagSchema>;