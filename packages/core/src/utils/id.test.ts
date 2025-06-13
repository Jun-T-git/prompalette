import { describe, it, expect } from 'vitest';

import { 
  generateId, 
  generatePromptId, 
  generateWorkspaceId, 
  generateTagId, 
  generateUserId,
  generateShareId 
} from './id';

describe('ID generation utilities', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBe(12);
  });
  
  it('should generate ID with prefix', () => {
    const id = generateId('test');
    
    expect(id).toMatch(/^test_[a-zA-Z0-9_-]{12}$/);
  });
  
  it('should generate prompt ID with correct prefix', () => {
    const id = generatePromptId();
    
    expect(id).toMatch(/^prm_[a-zA-Z0-9_-]{12}$/);
  });
  
  it('should generate workspace ID with correct prefix', () => {
    const id = generateWorkspaceId();
    
    expect(id).toMatch(/^wsp_[a-zA-Z0-9_-]{12}$/);
  });
  
  it('should generate tag ID with correct prefix', () => {
    const id = generateTagId();
    
    expect(id).toMatch(/^tag_[a-zA-Z0-9_-]{12}$/);
  });
  
  it('should generate user ID with correct prefix', () => {
    const id = generateUserId();
    
    expect(id).toMatch(/^usr_[a-zA-Z0-9_-]{12}$/);
  });
  
  it('should generate share ID with correct prefix', () => {
    const id = generateShareId();
    
    expect(id).toMatch(/^shr_[a-zA-Z0-9_-]{12}$/);
  });
});