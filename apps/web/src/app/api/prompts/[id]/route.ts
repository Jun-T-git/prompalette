/**
 * API Routes for individual prompt operations (PUT, DELETE, GET)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { getPromptService } from '@/lib/services/service-factory';
// import { handleApiError } from '@/lib/error-handling';

// Input validation schema for prompt updates
const updatePromptSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  content: z.string().min(1, '内容は必須です').max(10000, '内容は10000文字以内で入力してください'),
  tags: z.array(z.string()).max(10, 'タグは10個まで設定できます').optional().default([]),
  quick_access_key: z.string().max(50, 'クイックアクセスキーは50文字以内で入力してください').optional(),
  is_public: z.boolean().default(true),
});

/**
 * GET /api/prompts/[id] - Get single prompt by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const promptService = getPromptService();
    
    const prompt = await promptService.getById(id);
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが見つかりません' },
        { status: 404 }
      );
    }

    // Check if user can access this prompt
    if (!prompt.is_public && (!session?.user || session.user.id !== prompt.user_id)) {
      return NextResponse.json(
        { error: 'このプロンプトにアクセスする権限がありません' },
        { status: 403 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prompts/[id] - Update prompt
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    // 🔒 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 📝 入力データの取得とバリデーション
    const body = await request.json();
    const validatedData = updatePromptSchema.parse(body);

    const promptService = getPromptService();
    
    // 📋 既存プロンプトの取得
    const existingPrompt = await promptService.getById(id);
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'プロンプトが見つかりません' },
        { status: 404 }
      );
    }

    // 🔐 所有者チェック
    if (existingPrompt.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'このプロンプトを編集する権限がありません' },
        { status: 403 }
      );
    }

    // ✏️ プロンプト更新
    const updatedPrompt = await promptService.update(id, session.user.id, validatedData);
    
    if (!updatedPrompt) {
      return NextResponse.json(
        { error: 'プロンプトの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'バリデーションエラー',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id] - Delete prompt
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    // 🔒 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const promptService = getPromptService();
    
    // 📋 既存プロンプトの取得
    const existingPrompt = await promptService.getById(id);
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'プロンプトが見つかりません' },
        { status: 404 }
      );
    }

    // 🔐 所有者チェック
    if (existingPrompt.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'このプロンプトを削除する権限がありません' },
        { status: 403 }
      );
    }

    // 🗑️ プロンプト削除
    const success = await promptService.delete(id, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'プロンプトの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'プロンプトを削除しました',
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}