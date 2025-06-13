import { z } from 'zod';

import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../constants';

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_TITLE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  settings: z.record(z.unknown()).optional(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CreateWorkspaceSchema = WorkspaceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;

export const UpdateWorkspaceSchema = CreateWorkspaceSchema.partial();

export type UpdateWorkspace = z.infer<typeof UpdateWorkspaceSchema>;