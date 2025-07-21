import { NextRequest, NextResponse } from 'next/server';
import { getPromptService } from '@/lib/services/service-factory';
import { ApiResponse, SearchResult } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query.trim()) {
      return NextResponse.json<ApiResponse<SearchResult>>({
        success: true,
        data: {
          prompts: [],
          total: 0,
          hasMore: false,
        },
      });
    }

    const promptService = getPromptService();
    let searchResults;

    // @username 検索
    if (query.startsWith('@')) {
      const username = query.substring(1);
      searchResults = await promptService.getByUsername(username, false); // 公開プロンプトのみ
    }
    // #tag 検索
    else if (query.startsWith('#')) {
      const tag = query.substring(1);
      searchResults = await promptService.searchAdvanced({
        query: '',
        tags: [tag],
        isPublic: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit,
        offset,
      });
    }
    // /quickkey 検索
    else if (query.startsWith('/')) {
      const quickkey = query.substring(1);
      searchResults = await promptService.searchAdvanced({
        query: quickkey,
        isPublic: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit,
        offset,
      });
    }
    // 通常のキーワード検索
    else {
      searchResults = await promptService.searchAdvanced({
        query,
        isPublic: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit,
        offset,
      });
    }

    // 結果を配列として正規化
    const prompts = Array.isArray(searchResults) ? searchResults : searchResults?.prompts || [];
    const total = Array.isArray(searchResults) ? searchResults.length : searchResults?.total || 0;

    const result: SearchResult = {
      prompts: prompts.slice(0, limit),
      total,
      hasMore: prompts.length > limit,
    };

    return NextResponse.json<ApiResponse<SearchResult>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Search request failed',
        },
      },
      { status: 500 }
    );
  }
}