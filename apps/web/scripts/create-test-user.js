#!/usr/bin/env node

/**
 * ローカルSupabaseにテスト用ユーザーを作成するスクリプト
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('🚀 Creating test user in local Supabase...');
  
  // Create stub-user with the same UUID as in seed data
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'stub@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'スタブユーザー',
      username: 'stub-user'
    }
  });

  if (error) {
    console.error('❌ Error creating user:', error);
    return;
  }

  console.log('✅ Test user created successfully!');
  console.log('📧 Email: stub@example.com');
  console.log('🔑 Password: password123');
  console.log('🆔 User ID:', data.user.id);
  
  // Update the users table with the correct UUID
  const { error: updateError } = await supabase
    .from('users')
    .upsert({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'stub@example.com',
      name: 'スタブユーザー',
      username: 'stub-user',
      is_public: true
    });

  if (updateError) {
    console.error('❌ Error updating users table:', updateError);
  } else {
    console.log('✅ Users table updated with correct UUID');
  }
}

createTestUser().catch(console.error);