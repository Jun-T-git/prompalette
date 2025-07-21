import { NextRequest, NextResponse } from 'next/server';
import { getPromptService } from '@/lib/services/service-factory';
import { handleRouteError } from '@/lib/error-handling';
import { z } from 'zod';

// Advanced search validation schema
const DateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.')
}).refine(data => {
  const fromDate = new Date(data.from);
  const toDate = new Date(data.to);
  return fromDate <= toDate;
}, {
  message: 'Invalid date range. "from" date must be before or equal to "to" date.'
});

const AdvancedSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  dateRange: DateRangeSchema.optional(),
  isPublic: z.boolean().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'view_count', 'copy_count', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

// type AdvancedSearchRequest = z.infer<typeof AdvancedSearchSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = AdvancedSearchSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid search criteria',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const searchCriteria = validationResult.data;

    // Get prompt service
    const promptService = getPromptService();

    // Perform advanced search
    const searchResult = await promptService.advancedSearch(searchCriteria);

    return NextResponse.json({
      success: true,
      data: {
        results: searchResult.results,
        total: searchResult.total,
        hasMore: searchResult.hasMore,
        limit: searchCriteria.limit,
        offset: searchCriteria.offset,
        sortBy: searchCriteria.sortBy,
        sortOrder: searchCriteria.sortOrder
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return handleRouteError(error);
  }
}