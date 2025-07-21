import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth-utils';
import { getPromptService } from '@/lib/services/service-factory';
import { handleRouteError } from '@/lib/error-handling';
import { z } from 'zod';

// Validation schema for sync upload
const DesktopPromptSchema = z.object({
  desktop_id: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(false),
  quick_access_key: z.string().nullable().default(null),
  version: z.number().int().positive(),
  last_modified: z.string() // ISO date string
});

const SyncUploadSchema = z.object({
  prompts: z.array(DesktopPromptSchema),
  sync_session_id: z.string().min(1)
});

// Export types for use in tests
export type DesktopPrompt = z.infer<typeof DesktopPromptSchema>;
export type SyncUploadRequest = z.infer<typeof SyncUploadSchema>;

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SyncUploadSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { prompts, sync_session_id } = validationResult.data;

    // Get prompt service
    const promptService = getPromptService();

    // Perform sync operation
    const syncResult = await promptService.syncFromDesktop(
      user.id,
      prompts,
      sync_session_id
    );

    return NextResponse.json({
      success: true,
      data: {
        uploaded: syncResult.uploaded,
        updated: syncResult.updated,
        conflicts: syncResult.conflicts,
        session_id: syncResult.session_id
      }
    });

  } catch (error) {
    console.error('Sync upload error:', error);
    return handleRouteError(error);
  }
}