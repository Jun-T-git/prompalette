#!/usr/bin/env node
/* eslint-env node */

/**
 * 環境に応じて Tauri の設定ファイルをマージするスクリプト
 * 
 * 使用方法:
 * APP_ENV=development node scripts/build-env.js
 * APP_ENV=staging node scripts/build-env.js
 * APP_ENV=production node scripts/build-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPublicKey } from './inject-pubkey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数から環境を取得（デフォルトは production）
const env = process.env.APP_ENV || 'production';

// 環境名をファイル名にマッピング
const envFileMapping = {
  'development': 'dev',
  'staging': 'staging',
  'production': 'production'
};

const envFileName = envFileMapping[env] || env;

// 設定ファイルのパス
const baseConfigPath = path.join(__dirname, '../src-tauri/tauri.conf.json');
const envConfigPath = path.join(__dirname, `../src-tauri/tauri.conf.${envFileName}.json`);
const outputPath = path.join(__dirname, '../src-tauri/tauri.conf.json.tmp');

// ベース設定を読み込む
const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf-8'));

// 環境固有の設定が存在する場合はマージ
let finalConfig = baseConfig;
if (env !== 'production' && fs.existsSync(envConfigPath)) {
    const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf-8'));
    
    // 深いマージを実行
    finalConfig = deepMerge(baseConfig, envConfig);
    
    console.log(`✅ Merged configuration for ${env} environment`);
} else if (env === 'production') {
    console.log('✅ Using production configuration');
} else {
    console.warn(`⚠️  No specific configuration found for ${env} environment, using base configuration`);
}

// Inject Tauri public key if updater is active
if (finalConfig.plugins?.updater?.active) {
    try {
        const publicKey = loadPublicKey();
        finalConfig.plugins.updater.pubkey = publicKey;
        console.log('🔑 Injected Tauri updater public key');
    } catch (error) {
        console.warn('⚠️ Failed to inject public key:', error.message);
        console.warn('💡 Auto-update functionality may not work properly');
    }
}

// 一時ファイルに出力
fs.writeFileSync(outputPath, JSON.stringify(finalConfig, null, 2));

// 元のファイルをバックアップして置き換え
if (fs.existsSync(baseConfigPath + '.backup')) {
    fs.unlinkSync(baseConfigPath + '.backup');
}
fs.renameSync(baseConfigPath, baseConfigPath + '.backup');
fs.renameSync(outputPath, baseConfigPath);

console.log(`✅ Configuration updated for ${env} environment`);

/**
 * オブジェクトを深くマージする関数
 */
function deepMerge(target, source) {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// CI環境では設定復元をスキップ（複数のジョブが並行実行される可能性があるため）
if (!process.env.CI) {
    // プロセス終了時に設定を復元するためのクリーンアップ
    process.on('exit', () => {
        // ビルドが終了したら元の設定に戻す
        if (fs.existsSync(baseConfigPath + '.backup')) {
            try {
                fs.unlinkSync(baseConfigPath);
                fs.renameSync(baseConfigPath + '.backup', baseConfigPath);
                console.log('✅ Restored original configuration');
            } catch (e) {
                console.error('❌ Failed to restore original configuration:', e);
            }
        }
    });
} else {
    console.log('🔧 CI environment detected, skipping automatic config restoration');
}