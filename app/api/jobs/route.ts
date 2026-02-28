import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    return NextResponse.json({ jobs: data ?? [] });
  } catch (err) {
    console.error('Unexpected error in GET /api/jobs', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, companyName, description, seniority, mustHaveSkills, stages } = body;

    if (!id || !title || !companyName || !description || !seniority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('jobs').upsert({
      id,
      title,
      company_name: companyName,
      description,
      seniority,
      must_have_skills: mustHaveSkills ?? [],
      stages,
    });

    if (error) {
      console.error('Error saving job', error);
      return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in POST /api/jobs', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

