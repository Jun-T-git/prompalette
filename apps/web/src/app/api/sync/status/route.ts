import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth-utils';
import { getSyncService } from '@/lib/services/service-factory';
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
    const includeHistory = searchParams.get('history') === 'true';
    const limitParam = searchParams.get('limit');

    // Validate limit parameter if provided
    let limit = 10; // Default limit
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return NextResponse.json(
          { success: false, error: 'Invalid limit parameter. Must be between 1 and 100.' },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Get sync service
    const syncService = getSyncService();

    // Get sync status
    const syncStatus = await syncService.getSyncStatus(user.id);

    // Build response data
    const responseData: any = {
      status: syncStatus
    };

    // Include history if requested
    if (includeHistory) {
      const history = await syncService.getSessionHistory(user.id, limit);
      responseData.history = history;
    }

    return NextResponse.json({
      success: true,
      data: includeHistory ? responseData : syncStatus
    });

  } catch (error) {
    console.error('Sync status error:', error);
    return handleRouteError(error);
  }
}