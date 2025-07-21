import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase';
import { isLocalDevelopment, stubPromptStorage } from '@/lib/auth-stub';

interface StatRequest {
  type: 'view' | 'copy';
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Handle local development with stub data
  if (isLocalDevelopment) {
    try {
      let body: StatRequest;
      
      try {
        body = await request.json();
      } catch (parseError) {
        return NextResponse.json({ error: 'Invalid type. Must be "view" or "copy"' }, { status: 400 });
      }
      
      if (!body.type || !['view', 'copy'].includes(body.type)) {
        return NextResponse.json({ error: 'Invalid type. Must be "view" or "copy"' }, { status: 400 });
      }

      // Find and update the prompt in stub storage
      const promptIndex = stubPromptStorage.data.findIndex(p => p.id === id);
      if (promptIndex === -1) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }

      const updateField = body.type === 'view' ? 'view_count' : 'copy_count';
      stubPromptStorage.data[promptIndex][updateField] = (stubPromptStorage.data[promptIndex][updateField] || 0) + 1;

      return NextResponse.json({
        data: {
          id,
          type: body.type,
          updated: true,
        },
      });
    } catch (error) {
      console.error('Statistics API Error (stub):', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  
  const supabase = createServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    let body: StatRequest;
    
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid type. Must be "view" or "copy"' }, { status: 400 });
    }
    
    if (!body.type || !['view', 'copy'].includes(body.type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "view" or "copy"' }, { status: 400 });
    }

    const updateField = body.type === 'view' ? 'view_count' : 'copy_count';
    
    // First get the current count
    const { data: currentData, error: selectError } = await supabase
      .from('prompts')
      .select(`${updateField}`)
      .eq('id', id)
      .single();

    if (selectError) {
      console.error('Error selecting current count:', selectError);
      throw selectError;
    }

    const currentCount = (currentData as any)?.[updateField] || 0;
    
    // Increment the appropriate counter
    const { error } = await supabase
      .from('prompts')
      .update({
        [updateField]: currentCount + 1,
      })
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error updating statistics:', error);
      throw error;
    }

    return NextResponse.json({
      data: {
        id,
        type: body.type,
        updated: true,
      },
    });
  } catch (error) {
    console.error('Statistics API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}