/**
 * Resolves the effective employer_id for API routes when auth is not yet implemented.
 * Uses DEFAULT_EMPLOYER_ID from env, or the first employer profile in DB, or creates one
 * (user + employer_profile + employer role).
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
    .from('employer_profiles')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (selectError) {
    const msg = selectError.code === 'PGRST204' || selectError.message?.includes('relation')
      ? 'Database schema not applied. Run supabase-schema.sql in the Supabase SQL Editor first (Project → SQL Editor).'
      : `Could not load employer_profiles: ${selectError.message}`;
    throw new Error(msg);
  }

  if (existing?.id) return existing.id;

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ email: DEFAULT_EMAIL, full_name: DEFAULT_COMPANY })
    .select('id')
    .single();

  if (userError || !user?.id) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', DEFAULT_EMAIL)
      .maybeSingle();
    if (existingUser?.id) {
      const { data: profile } = await supabase
        .from('employer_profiles')
        .insert({ user_id: existingUser.id, company_name: DEFAULT_COMPANY })
        .select('id')
        .single();
      if (profile?.id) return profile.id;
    }
    throw new Error(
      `Could not create default employer. Run supabase-schema.sql in Supabase SQL Editor first. Details: ${userError?.message ?? 'unknown'}`
    );
  }

  await supabase.from('user_roles').insert({ user_id: user.id, role: 'employer' });

  const { data: profile, error: profileError } = await supabase
    .from('employer_profiles')
    .insert({ user_id: user.id, company_name: DEFAULT_COMPANY })
    .select('id')
    .single();

  if (profileError || !profile?.id) {
    throw new Error(
      `Could not create default employer profile. Run supabase-schema.sql in Supabase SQL Editor first. Details: ${profileError?.message ?? 'unknown'}`
    );
  }
  return profile.id;
}
