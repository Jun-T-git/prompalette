import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { validateAuthentication, validateUserId } from '@/lib/auth-utils';
import { getServices } from '@/lib/services/service-factory';
import { handleGenericError } from '@/lib/error-handling';

// サービスレイヤーを取得
const { promptService } = getServices();

// 入力検証スキーマ
const createPromptSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().trim().min(1, 'Content is required').max(100000, 'Content too long'),
  tags: z.array(z.string()).optional().default([]),
  quick_access_key: z.string().optional(),
  is_public: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // 🔒 強化された認証検証
    const authResult = await validateAuthentication(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const user = authResult.user;

    // 🔒 ユーザーIDの検証
    if (!validateUserId(user.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // 🔒 入力検証
    const validation = createPromptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { title, content, tags, quick_access_key, is_public } = validation.data;

    // 🎯 サービスレイヤーを使用してプロンプトを作成
    const prompt = await promptService.create(user.id, {
      title,
      content,
      tags,
      quick_access_key: quick_access_key || null,
      is_public,
    });

    return NextResponse.json({ data: prompt });
  } catch (error) {
    console.error('API error:', error);
    const appError = handleGenericError(error);
    return NextResponse.json(
      { error: appError.message, details: appError.details },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 🔒 強化された認証検証
    const authResult = await validateAuthentication(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const user = authResult.user;

    // 🔒 ユーザーIDの検証
    if (!validateUserId(user.id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // 🎯 サービスレイヤーを使用してプロンプトを取得
    const prompts = await promptService.getByUserId(user.id);

    return NextResponse.json({ data: prompts });
  } catch (error) {
    console.error('API error:', error);
    const appError = handleGenericError(error);
    return NextResponse.json(
      { error: appError.message, details: appError.details },
      { status: 500 }
    );
  }
}