#!/usr/bin/env node

/**
 * Production Database Migration Script
 * 本番環境のデータベースマイグレーションを実行
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Production Database Migration');
console.log('================================');

// 環境変数の確認
const requiredEnvVars = [
  'SUPABASE_ACCESS_TOKEN',
  'SUPABASE_PROJECT_REF'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these environment variables and try again.');
  process.exit(1);
}

try {
  // マイグレーションファイルの検証
  console.log('🔍 Validating migration files...');
  execSync('node scripts/validate-migration.js', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  // Supabase CLIのバージョン確認
  console.log('🔧 Checking Supabase CLI...');
  try {
    execSync('supabase --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing Supabase CLI...');
    execSync('npm install -g @supabase/cli', { stdio: 'inherit' });
  }
  
  // データベースマイグレーションの実行
  console.log('🗄️ Running database migrations...');
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  
  execSync(`supabase db push --linked --project-ref ${projectRef}`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    }
  });
  
  // マイグレーション状況の確認
  console.log('📊 Checking migration status...');
  execSync(`supabase migration list --linked --project-ref ${projectRef}`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
    }
  });
  
  console.log('✅ Database migration completed successfully!');
  console.log('🌐 Production database is now up to date.');
  
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  console.error('\n🔧 Troubleshooting:');
  console.error('1. Check if Supabase access token is valid');
  console.error('2. Verify project reference is correct');
  console.error('3. Ensure migration files are valid');
  console.error('4. Check Supabase project status');
  process.exit(1);
}