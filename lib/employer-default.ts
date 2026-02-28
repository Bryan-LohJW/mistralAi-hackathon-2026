/**
 * Resolves the effective employer_id for API routes when auth is not yet implemented.
 * Uses DEFAULT_EMPLOYER_ID from env, or the first employer in DB, or creates one.
 */
import { createServerSupabaseClient } from '@/lib/supabaseClient';

const DEFAULT_EMAIL = 'employer@aegishire.demo';
const DEFAULT_COMPANY = 'AegisHire Demo';

export async function getDefaultEmployerId(): Promise<string> {
  const envId = process.env.DEFAULT_EMPLOYER_ID;
  if (envId) return envId;

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch (e) {
    throw new Error(
      'Supabase server client failed. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (Project Settings → API in Supabase).'
    );
  }

  const { data: existing, error: selectError } = await supabase
    .from('employer_users')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (selectError) {
    const msg = selectError.code === 'PGRST204' || selectError.message?.includes('relation')
      ? 'Database schema not applied. Run supabase-schema.sql in the Supabase SQL Editor first (Project → SQL Editor).'
      : `Could not load employer_users: ${selectError.message}`;
    throw new Error(msg);
  }

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from('employer_users')
    .insert({ email: DEFAULT_EMAIL, company_name: DEFAULT_COMPANY })
    .select('id')
    .single();

  if (error || !created?.id) {
    throw new Error(
      `Could not create default employer. Run supabase-schema.sql in Supabase SQL Editor first. Details: ${error?.message ?? 'unknown'}`
    );
  }
  return created.id;
}
