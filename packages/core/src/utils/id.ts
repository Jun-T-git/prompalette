import { nanoid } from 'nanoid';

export const generateId = (prefix?: string): string => {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
};

export const generatePromptId = () => generateId('prm');
export const generateWorkspaceId = () => generateId('wsp');
export const generateTagId = () => generateId('tag');
export const generateUserId = () => generateId('usr');
export const generateShareId = () => generateId('shr');