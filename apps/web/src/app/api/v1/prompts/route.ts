import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const tag = searchParams.get('tag');
  
  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    let query = supabase
      .from('prompts')
      .select('id, title, content, tags, created_at, updated_at, users(username)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: prompts, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: prompts,
      pagination: {
        page,
        limit,
        total: prompts?.length || 0
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  
  // API キー認証
  if (!apiKey || !validateApiKey(apiKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, tags } = body;

    const supabase = createServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert({
        title,
        content,
        tags: tags || [],
        is_public: true,
        user_id: 'api-user' // API経由の場合の特別ユーザー
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function validateApiKey(apiKey: string): boolean {
  // 実際の実装では、データベースでAPIキーを検証
  return process.env.VALID_API_KEYS?.split(',').includes(apiKey) || false;
}