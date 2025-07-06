/**
 * Environment utility functions for frontend
 * Uses Tauri commands for reliable environment detection
 */

import { invoke } from '@tauri-apps/api/core';

export interface EnvironmentInfo {
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  appName: string;
  storagePrefix: string;
  appIdentifier: string;
  windowTitle: string;
}

// Cache for environment info to avoid repeated Tauri calls
let environmentCache: EnvironmentInfo | null = null;

/**
 * Get current environment information from Tauri backend
 * This is the authoritative source of environment detection
 */
export async function getEnvironmentInfo(): Promise<EnvironmentInfo> {
  if (environmentCache !== null) {
    return environmentCache;
  }

  try {
    const info = await invoke<{
      environment: string;
      app_name: string;
      app_identifier: string;
      window_title: string;
      storage_prefix: string;
    }>('get_environment_info');

    const environment = info.environment as 'development' | 'staging' | 'production';
    
    environmentCache = {
      environment,
      isDevelopment: environment === 'development',
      isStaging: environment === 'staging',
      isProduction: environment === 'production',
      appName: info.app_name,
      storagePrefix: info.storage_prefix,
      appIdentifier: info.app_identifier,
      windowTitle: info.window_title,
    };

    return environmentCache;
  } catch (error) {
    console.warn('Failed to get environment info from Tauri, using fallback:', error);
    
    // Fallback: 最後の手段として production を返す
    environmentCache = {
      environment: 'production',
      isDevelopment: false,
      isStaging: false,
      isProduction: true,
      appName: 'PromPalette',
      storagePrefix: 'prompalette',
      appIdentifier: 'com.prompalette.app',
      windowTitle: 'PromPalette',
    };
    
    return environmentCache;
  }
}

/**
 * Get environment-specific localStorage key
 */
export async function getStorageKey(key: string): Promise<string> {
  const env = await getEnvironmentInfo();
  return `${env.storagePrefix}-${key}`;
}

/**
 * Environment-aware localStorage wrapper
 * All methods are async to ensure proper environment detection
 */
export const envStorage = {
  async getItem(key: string): Promise<string | null> {
    const storageKey = await getStorageKey(key);
    return localStorage.getItem(storageKey);
  },
  
  async setItem(key: string, value: string): Promise<void> {
    const storageKey = await getStorageKey(key);
    localStorage.setItem(storageKey, value);
  },
  
  async removeItem(key: string): Promise<void> {
    const storageKey = await getStorageKey(key);
    localStorage.removeItem(storageKey);
  },
  
  async clear(): Promise<void> {
    const env = await getEnvironmentInfo();
    const prefix = `${env.storagePrefix}-`;
    
    // Only clear items that belong to current environment
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

/**
 * Reset environment cache (mainly for testing)
 */
export function resetEnvironmentCache(): void {
  environmentCache = null;
}

/**
 * Check if running in Tauri environment
 * @deprecated Use getEnvironmentInfo() instead for more detailed environment detection
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         ((window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== undefined ||
          (window as { __TAURI__?: unknown }).__TAURI__ !== undefined);
}