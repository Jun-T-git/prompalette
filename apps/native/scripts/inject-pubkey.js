#!/usr/bin/env node

/**
 * Inject Tauri updater public key into configuration files
 * This script ensures consistent public key management across environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_KEY_PATH = path.join(__dirname, '../src-tauri/keys/public.key');
const CONFIG_FILES = [
  'src-tauri/tauri.conf.json',
  'src-tauri/tauri.conf.staging.json'
  // Note: tauri.conf.dev.json has updater disabled, so no key needed
];

function loadPublicKey() {
  try {
    if (!fs.existsSync(PUBLIC_KEY_PATH)) {
      throw new Error(`Public key not found: ${PUBLIC_KEY_PATH}. Run 'pnpm tauri signer generate -w ~/.tauri/prompalette.key' then copy public key.`);
    }
    
    const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8').trim();
    if (!publicKey) {
      throw new Error('Public key file is empty');
    }
    
    return publicKey;
  } catch (error) {
    throw new Error(`Failed to load public key: ${error.message}`);
  }
}

function injectPublicKey(configPath, publicKey) {
  try {
    const fullPath = path.join(__dirname, '..', configPath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn('⚠️ Config file not found, skipping:', fullPath);
      return;
    }

    const configContent = fs.readFileSync(fullPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Check if updater is active
    if (!config.plugins?.updater?.active) {
      console.log('ℹ️ Updater disabled, skipping:', configPath);
      return;
    }
    
    // Inject public key
    config.plugins.updater.pubkey = publicKey;
    
    // Write back with proper formatting
    const updatedContent = JSON.stringify(config, null, 2) + '\n';
    fs.writeFileSync(fullPath, updatedContent);
    
    console.log('✅ Injected public key into:', configPath);
  } catch (error) {
    console.error('❌ Failed to update config:', configPath, error.message);
    process.exit(1);
  }
}

function main() {
  console.log('🔑 Injecting Tauri updater public key...');
  
  const publicKey = loadPublicKey();
  
  CONFIG_FILES.forEach(configPath => {
    injectPublicKey(configPath, publicKey);
  });
  
  console.log('🎉 Public key injection completed successfully');
}

export { loadPublicKey, injectPublicKey };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}