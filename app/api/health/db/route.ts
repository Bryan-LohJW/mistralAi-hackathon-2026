import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';

const REQUIRED_TABLES = [
  'users',
  'user_roles',
  'employer_profiles',
  'job_profiles',
  'job_stages',
  'stage_question_bank',
  'job_distribution_status',
  'public_job_views',
  'job_applications',
  'focus_events',
  'interview_sessions',
  'tool_usage_logs',
  'stage_scores',
  'question_scores',
];

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const missing: string[] = [];
    const errors: { table: string; message: string }[] = [];

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        if (error.message?.includes('relation') || error.code === 'PGRST204') {
          missing.push(table);
        } else {
          errors.push({ table, message: error.message });
        }
      }
    }

    if (missing.length) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Schema not applied',
          missingTables: missing,
          hint: 'Run supabase-schema.sql in Supabase SQL Editor (Project → SQL Editor).',
        },
        { status: 503 }
      );
    }

    if (errors.length) {
      return NextResponse.json(
        { ok: false, error: 'Database errors', details: errors },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Database is correctly set up',
      tablesChecked: REQUIRED_TABLES.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Database check failed',
        message,
        hint: message.includes('SUPABASE')
          ? 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings → API in Supabase).'
          : undefined,
      },
      { status: 503 }
    );
  }
}
