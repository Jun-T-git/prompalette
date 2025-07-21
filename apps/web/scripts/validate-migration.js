#!/usr/bin/env node

/**
 * Migration validation script
 * Checks if migration files are properly formatted and valid
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const SCHEMA_FILE = path.join(__dirname, '../supabase/schema.sql');

function validateMigrationFiles() {
  console.log('🔍 Validating migration files...\n');
  
  // Check if migrations directory exists
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Migration directory not found:', MIGRATIONS_DIR);
    return false;
  }
  
  // Get all migration files
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    console.warn('⚠️  No migration files found');
    return true;
  }
  
  console.log(`📁 Found ${migrationFiles.length} migration file(s):`);
  
  let allValid = true;
  
  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Validate file naming convention
    const timestampRegex = /^\d{14}_.*\.sql$/;
    if (!timestampRegex.test(file)) {
      console.error(`❌ Invalid file name format: ${file}`);
      console.error('   Expected format: YYYYMMDDHHMMSS_description.sql');
      allValid = false;
      continue;
    }
    
    // Check if file has content
    if (content.trim().length === 0) {
      console.error(`❌ Empty migration file: ${file}`);
      allValid = false;
      continue;
    }
    
    // Basic SQL validation
    const hasCreateTable = content.includes('CREATE TABLE');
    const hasEnableRLS = content.includes('ENABLE ROW LEVEL SECURITY');
    const hasCreatePolicy = content.includes('CREATE POLICY');
    
    console.log(`✅ ${file}`);
    console.log(`   - Has CREATE TABLE: ${hasCreateTable ? '✓' : '✗'}`);
    console.log(`   - Has RLS enabled: ${hasEnableRLS ? '✓' : '✗'}`);
    console.log(`   - Has RLS policies: ${hasCreatePolicy ? '✓' : '✗'}`);
    console.log(`   - Size: ${Math.round(content.length / 1024 * 100) / 100}KB\n`);
  }
  
  return allValid;
}

function validateSchemaFile() {
  console.log('🔍 Validating schema file...\n');
  
  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error('❌ Schema file not found:', SCHEMA_FILE);
    return false;
  }
  
  const content = fs.readFileSync(SCHEMA_FILE, 'utf8');
  
  // Check required components
  const checks = [
    ['UUID extension', content.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')],
    ['Users table', content.includes('CREATE TABLE IF NOT EXISTS users')],
    ['Prompts table', content.includes('CREATE TABLE IF NOT EXISTS prompts')],
    ['Indexes', content.includes('CREATE INDEX')],
    ['RLS enabled', content.includes('ENABLE ROW LEVEL SECURITY')],
    ['RLS policies', content.includes('CREATE POLICY')],
    ['Search function', content.includes('CREATE OR REPLACE FUNCTION search_prompts')],
    ['Username generation', content.includes('CREATE OR REPLACE FUNCTION generate_unique_username')]
  ];
  
  let allValid = true;
  
  for (const [name, valid] of checks) {
    if (valid) {
      console.log(`✅ ${name}`);
    } else {
      console.error(`❌ Missing: ${name}`);
      allValid = false;
    }
  }
  
  console.log(`\n📊 Schema file size: ${Math.round(content.length / 1024 * 100) / 100}KB\n`);
  
  return allValid;
}

function main() {
  console.log('🚀 PromPalette Migration Validator\n');
  
  const migrationValid = validateMigrationFiles();
  const schemaValid = validateSchemaFile();
  
  if (migrationValid && schemaValid) {
    console.log('✅ All validation checks passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start Docker: docker start');
    console.log('2. Start Supabase: pnpm db:start');
    console.log('3. Run migrations: pnpm db:migrate');
    console.log('4. Generate types: pnpm db:generate-types');
    process.exit(0);
  } else {
    console.error('\n❌ Validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

main();