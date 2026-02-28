import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';

// Create a candidate at application time
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, formData, fitResult } = body;

    if (!jobId || !formData?.name || !formData?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        job_id: jobId,
        name: formData.name,
        email: formData.email,
        education: formData.education ?? null,
        experience_summary: formData.experience ?? null,
        resume_text: formData.resumeText ?? null,
        status: 'applied',
        fit_score: fitResult?.fitScore ?? null,
        fit_justification: fitResult?.justification ?? null,
        matched_skills: fitResult?.matchedSkills ?? [],
        missing_skills: fitResult?.missingSkills ?? [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating candidate', error);
      return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }

    return NextResponse.json({ candidateId: data.id });
  } catch (err) {
    console.error('Unexpected error in POST /api/candidates', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

// Update candidate with final interview results
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId, stageResults, status } = body;

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('candidates')
      .update({
        stage_results: stageResults ?? null,
        status: status ?? 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', candidateId);

    if (error) {
      console.error('Error updating candidate', error);
      return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in PATCH /api/candidates', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

