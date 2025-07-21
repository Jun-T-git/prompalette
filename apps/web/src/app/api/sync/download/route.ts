import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth-utils';
import { getPromptService } from '@/lib/services/service-factory';
import { handleRouteError } from '@/lib/error-handling';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const lastSync = searchParams.get('lastSync');
    const offsetParam = searchParams.get('offset');
    const limitParam = searchParams.get('limit');

    // Validate lastSync format if provided
    if (lastSync) {
      const date = new Date(lastSync);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid lastSync format. Expected ISO date string.' },
          { status: 400 }
        );
      }
    }

    // Parse pagination parameters
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const limit = limitParam ? parseInt(limitParam, 10) : 1000; // Default limit

    if (offset < 0 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters. Offset must be >= 0, limit must be 1-1000.' },
        { status: 400 }
      );
    }

    // Get prompt service
    const promptService = getPromptService();

    // Get prompts based on sync mode
    let prompts;
    if (lastSync) {
      // Incremental sync - get only updated prompts
      prompts = await promptService.getUpdatedSince(user.id, lastSync, { offset, limit });
    } else {
      // Full sync - get all prompts
      prompts = await promptService.getAllForSync(user.id, { offset, limit });
    }

    return NextResponse.json({
      success: true,
      data: {
        prompts,
        total: prompts.length,
        offset,
        limit,
        ...(lastSync && { lastSync }),
        syncTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sync download error:', error);
    return handleRouteError(error);
  }
}