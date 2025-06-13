export const MAX_PROMPT_LENGTH = 10000;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_TAG_LENGTH = 50;
export const MAX_TAGS_PER_PROMPT = 10;

export const DEFAULT_WORKSPACE_NAME = 'Default';
export const DEFAULT_WORKSPACE_ID = 'default';

export const PROMPT_VISIBILITY = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  SHARED: 'shared',
} as const;

export const PROMPT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;