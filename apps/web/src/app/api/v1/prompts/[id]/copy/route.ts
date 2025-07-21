import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabase } from '@/lib/supabase';

const ParamsSchema = z.object({
  id: z.string().uuid('Invalid prompt ID'),
});

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get supabase service client
    const supabase = createServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }
    
    // Resolve params
    const resolvedParams = await params;
    
    // Validate params
    const validatedParams = ParamsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json({ success: false, error: 'Invalid prompt ID' }, { status: 400 });
    }
    
    const { id } = validatedParams.data;

    // Get the prompt to check if it's public
    const { data: prompt, error: fetchError } = await supabase
      .from('prompts')
      .select('id, title, is_public, view_count, copy_count')
      .eq('id', id)
      .single();

    if (fetchError || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Only track copies for public prompts
    if (!prompt.is_public) {
      return NextResponse.json(
        { success: false, error: 'Cannot track copies for private prompts' },
        { status: 403 }
      );
    }

    // Increment copy count
    const { data: updatedPrompt, error: updateError } = await supabase
      .from('prompts')
      .update({ 
        copy_count: prompt.copy_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, title, view_count, copy_count')
      .single();

    if (updateError || !updatedPrompt) {
      throw new Error('Failed to update copy count');
    }

    // Return updated prompt data
    const response = {
      success: true,
      data: {
        id: updatedPrompt.id,
        title: updatedPrompt.title,
        viewCount: updatedPrompt.view_count,
        copyCount: updatedPrompt.copy_count,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Copy count API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}