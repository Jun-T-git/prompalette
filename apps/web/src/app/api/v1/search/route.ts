import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  // const scope = searchParams.get('scope') || 'public'; // 'all' | 'mine' | 'public' // TODO: Implement scope filtering
  const sort = searchParams.get('sort') || 'created_at'; // 'relevance' | 'created_at' | 'updated_at'
  
  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    // Handle empty query
    if (!query.trim()) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
        },
        searchType: 'empty',
      });
    }

    let searchType = 'general';
    let supabaseQuery = supabase
      .from('prompts')
      .select('id, title, content, tags, quick_access_key, slug, created_at, updated_at, users(username)')
      .eq('is_public', true);

    // Handle special search syntax
    if (query.startsWith('@')) {
      // User search: @username
      searchType = 'user';
      const username = query.substring(1);
      // First get the user ID, then filter prompts by user_id
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (userError || !users) {
        // If user not found, return empty results
        return NextResponse.json({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
          },
          searchType,
          query,
        });
      }
      
      supabaseQuery = supabaseQuery
        .eq('user_id', users.id);
    } else if (query.startsWith('#')) {
      // Tag search: #tag
      searchType = 'tag';
      const tag = query.substring(1);
      supabaseQuery = supabaseQuery
        .contains('tags', [tag]);
    } else if (query.startsWith('/')) {
      // Quick access key search: /quickkey
      searchType = 'quickkey';
      const quickkey = query.substring(1);
      supabaseQuery = supabaseQuery
        .ilike('quick_access_key', `%${quickkey}%`);
    } else {
      // General search in title and content
      searchType = 'general';
      supabaseQuery = supabaseQuery
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    // Apply sorting
    const ascending = sort === 'created_at' ? false : true;
    supabaseQuery = supabaseQuery.order(sort, { ascending });

    // Apply pagination
    const { data: prompts, error } = await supabaseQuery
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: prompts || [],
      pagination: {
        page,
        limit,
        total: prompts?.length || 0,
      },
      searchType,
      query,
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}