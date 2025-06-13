import { describe, it, expect } from 'vitest';

import { PROMPT_VISIBILITY, PROMPT_STATUS } from '../constants';

import { PromptSchema, CreatePromptSchema, UpdatePromptSchema } from './prompt';

describe('Prompt models', () => {
  describe('PromptSchema', () => {
    it('should validate a valid prompt', () => {
      const prompt = {
        id: 'prm_123',
        title: 'Test Prompt',
        content: 'This is a test prompt content',
        workspaceId: 'wsp_123',
        tagIds: ['tag_1', 'tag_2'],
        visibility: PROMPT_VISIBILITY.PRIVATE,
        status: PROMPT_STATUS.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      };
      
      const result = PromptSchema.safeParse(prompt);
      
      expect(result.success).toBe(true);
    });
    
    it('should fail validation for missing required fields', () => {
      const prompt = {
        title: 'Test Prompt',
      };
      
      const result = PromptSchema.safeParse(prompt);
      
      expect(result.success).toBe(false);
    });
    
    it('should fail validation for title exceeding max length', () => {
      const prompt = {
        id: 'prm_123',
        title: 'a'.repeat(101),
        content: 'Test content',
        workspaceId: 'wsp_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = PromptSchema.safeParse(prompt);
      
      expect(result.success).toBe(false);
    });
  });
  
  describe('CreatePromptSchema', () => {
    it('should validate create prompt data', () => {
      const createData = {
        title: 'New Prompt',
        content: 'This is the prompt content',
        workspaceId: 'wsp_123',
        description: 'A helpful prompt',
        tagIds: ['tag_1'],
      };
      
      const result = CreatePromptSchema.safeParse(createData);
      
      expect(result.success).toBe(true);
    });
    
    it('should not require id and timestamps', () => {
      const createData = {
        title: 'New Prompt',
        content: 'Content',
        workspaceId: 'wsp_123',
      };
      
      const result = CreatePromptSchema.safeParse(createData);
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('UpdatePromptSchema', () => {
    it('should allow partial updates', () => {
      const updateData = {
        title: 'Updated Title',
      };
      
      const result = UpdatePromptSchema.safeParse(updateData);
      
      expect(result.success).toBe(true);
    });
    
    it('should validate field constraints on update', () => {
      const updateData = {
        title: 'a'.repeat(101),
      };
      
      const result = UpdatePromptSchema.safeParse(updateData);
      
      expect(result.success).toBe(false);
    });
  });
});