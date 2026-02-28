import { createClient } from '@supabase/supabase-js';

// Typed view of the Supabase database aligned with the
// multi-stage interview platform plan.
export type Database = {
  public: {
    Tables: {
      // --- Employer & job modeling ---
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          profile_summary: string | null;
          resume_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          profile_summary?: string | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };

      user_roles: {
        Row: {
          user_id: string;
          role: 'employer' | 'candidate';
        };
        Insert: {
          user_id: string;
          role: 'employer' | 'candidate';
        };
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>;
      };

      employer_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          role: 'admin' | 'recruiter' | 'hiring_manager';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          role?: 'admin' | 'recruiter' | 'hiring_manager';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['employer_profiles']['Insert']>;
      };
      job_profiles: {
        Row: {
          id: string;
          employer_id: string;
          title: string;
          company_name: string;
          location: string | null;
          description: string;
          seniority: string;
          category: string | null;
          must_have_skills: string[] | null;
          pipeline_config: any | null;
          publish_state: 'draft' | 'published' | 'archived';
          public_slug: string | null;
          rubric_json: any | null;
          stage_plan_json: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          title: string;
          company_name: string;
          location?: string | null;
          description: string;
          seniority: string;
          category?: string | null;
          must_have_skills?: string[] | null;
          pipeline_config?: any | null;
          publish_state?: 'draft' | 'published' | 'archived';
          public_slug?: string | null;
          rubric_json?: any | null;
          stage_plan_json?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['job_profiles']['Insert']>;
      };
      job_stages: {
        Row: {
          id: string;
          job_profile_id: string;
          index: number;
          type: 'behavioral' | 'coding' | 'case' | 'leadership';
          duration_minutes: number | null;
          ai_usage_policy: 'allowed' | 'not_allowed' | 'limited';
          proctoring_policy: 'relaxed' | 'moderate' | 'strict' | 'exam';
          competencies: string[] | null;
          stage_weights: any | null;
          interviewer_voice_id: string | null;
          question_source: 'employer_only' | 'hybrid' | 'ai_only';
          created_at: string;
        };
        Insert: {
          id?: string;
          job_profile_id: string;
          index: number;
          type: 'behavioral' | 'coding' | 'case' | 'leadership';
          duration_minutes?: number | null;
          ai_usage_policy: 'allowed' | 'not_allowed' | 'limited';
          proctoring_policy: 'relaxed' | 'moderate' | 'strict' | 'exam';
          competencies?: string[] | null;
          stage_weights?: any | null;
          interviewer_voice_id?: string | null;
          question_source: 'employer_only' | 'hybrid' | 'ai_only';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['job_stages']['Insert']>;
      };
      stage_question_bank: {
        Row: {
          id: string;
          employer_id: string;
          job_stage_id: string | null;
          job_profile_id: string | null;
          question_text: string;
          category: string | null;
          difficulty: string | null;
          mandatory: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          job_stage_id?: string | null;
          job_profile_id?: string | null;
          question_text: string;
          category?: string | null;
          difficulty?: string | null;
          mandatory?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stage_question_bank']['Insert']>;
      };
      job_distribution_status: {
        Row: {
          id: string;
          job_profile_id: string;
          channel: 'linkedin' | 'seek' | 'aegishire_public';
          status: 'draft' | 'queued' | 'posted' | 'updated' | 'closed' | 'error';
          external_job_id: string | null;
          last_payload: any | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_profile_id: string;
          channel: 'linkedin' | 'seek' | 'aegishire_public';
          status?: 'draft' | 'queued' | 'posted' | 'updated' | 'closed' | 'error';
          external_job_id?: string | null;
          last_payload?: any | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['job_distribution_status']['Insert']>;
      };
      public_job_views: {
        Row: {
          id: string;
          job_profile_id: string;
          public_id: string;
          last_viewed_at: string | null;
          view_count: number | null;
          analytics: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_profile_id: string;
          public_id: string;
          last_viewed_at?: string | null;
          view_count?: number | null;
          analytics?: any | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['public_job_views']['Insert']>;
      };

      job_applications: {
        Row: {
          id: string;
          user_id: string;
          job_profile_id: string;
          status: 'invited' | 'applied' | 'screening' | 'in_interview' | 'completed' | 'offered' | 'rejected' | 'withdrawn';
          current_stage_index: number | null;
          invited_at: string | null;
          applied_at: string | null;
          rejected_at: string | null;
          offered_at: string | null;
          withdrawn_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_profile_id: string;
          status?: 'invited' | 'applied' | 'screening' | 'in_interview' | 'completed' | 'offered' | 'rejected' | 'withdrawn';
          current_stage_index?: number | null;
          invited_at?: string | null;
          applied_at?: string | null;
          rejected_at?: string | null;
          offered_at?: string | null;
          withdrawn_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['job_applications']['Insert']>;
      };

      // --- Candidate-side events & sessions ---
      focus_events: {
        Row: {
          id: string;
          candidate_id: string | null;
          job_profile_id: string | null;
          stage_id: string | null;
          event_type: 'focus_lost' | 'focus_gained' | 'visibility_hidden' | 'visibility_visible';
          started_at: string;
          ended_at: string | null;
          duration_ms: number | null;
          policy: 'relaxed' | 'moderate' | 'strict' | 'exam';
          explanation: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id?: string | null;
          job_profile_id?: string | null;
          stage_id?: string | null;
          event_type: 'focus_lost' | 'focus_gained' | 'visibility_hidden' | 'visibility_visible';
          started_at?: string;
          ended_at?: string | null;
          duration_ms?: number | null;
          policy: 'relaxed' | 'moderate' | 'strict' | 'exam';
          explanation?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['focus_events']['Insert']>;
      };
      interview_sessions: {
        Row: {
          id: string;
          candidate_id: string;
          job_profile_id: string;
          application_id: string | null;
          current_stage_index: number | null;
          current_question_index: number | null;
          stage_statuses: any | null;
          answers: any | null;
          started_at: string;
          last_activity_at: string;
          status: 'active' | 'completed' | 'abandoned' | 'cancelled';
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_profile_id: string;
          application_id?: string | null;
          current_stage_index?: number | null;
          current_question_index?: number | null;
          stage_statuses?: any | null;
          answers?: any | null;
          started_at?: string;
          last_activity_at?: string;
          status?: 'active' | 'completed' | 'abandoned' | 'cancelled';
        };
        Update: Partial<Database['public']['Tables']['interview_sessions']['Insert']>;
      };

      // --- Tools & scoring ---
      tool_usage_logs: {
        Row: {
          id: string;
          session_id: string;
          stage_id: string | null;
          tool_type: 'scratchpad' | 'reference_summarizer' | 'code_helper' | 'prompt_coach';
          prompt: string;
          response_excerpt: string | null;
          full_response_ref: string | null;
          validation_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          stage_id?: string | null;
          tool_type: 'scratchpad' | 'reference_summarizer' | 'code_helper' | 'prompt_coach';
          prompt: string;
          response_excerpt?: string | null;
          full_response_ref?: string | null;
          validation_note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tool_usage_logs']['Insert']>;
      };
      stage_scores: {
        Row: {
          id: string;
          session_id: string;
          stage_id: string;
          overall_score: number | null;
          confidence: number | null;
          competency_scores: any | null;
          flags: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          stage_id: string;
          overall_score?: number | null;
          confidence?: number | null;
          competency_scores?: any | null;
          flags?: any | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stage_scores']['Insert']>;
      };
      question_scores: {
        Row: {
          id: string;
          session_id: string;
          stage_id: string;
          question_id: string | null;
          question_index: number | null;
          score: number | null;
          competency_scores: any | null;
          flags: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          stage_id: string;
          question_id?: string | null;
          question_index?: number | null;
          score?: number | null;
          competency_scores?: any | null;
          flags?: any | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['question_scores']['Insert']>;
      };

      // --- Legacy tables used by existing routes ---
      jobs: {
        Row: {
          id: string;
          title: string;
          company_name: string;
          location: string | null;
          description: string;
          seniority: string;
          must_have_skills: string[] | null;
          stages: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          company_name: string;
          location?: string | null;
          description: string;
          seniority: string;
          must_have_skills?: string[] | null;
          stages?: any | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
      candidates: {
        Row: {
          id: string;
          job_id: string;
          job_profile_id: string | null;
          user_id: string | null;
          name: string;
          email: string;
          education: string | null;
          experience_summary: string | null;
          resume_text: string | null;
          status: string;
          fit_score: number | null;
          fit_justification: string | null;
          matched_skills: string[] | null;
          missing_skills: string[] | null;
          stage_results: any | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          job_profile_id?: string | null;
          user_id?: string | null;
          name: string;
          email: string;
          education?: string | null;
          experience_summary?: string | null;
          resume_text?: string | null;
          status?: string;
          fit_score?: number | null;
          fit_justification?: string | null;
          matched_skills?: string[] | null;
          missing_skills?: string[] | null;
          stage_results?: any | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>;
      };
    };
    Views: {
      job_application_stats: {
        Row: {
          job_profile_id: string;
          employer_id: string;
          title: string;
          company_name: string;
          category: string | null;
          publish_state: 'draft' | 'published' | 'archived';
          total_applications: number;
          num_invited: number;
          num_applied: number;
          num_screening: number;
          num_in_interview: number;
          num_completed: number;
          num_offered: number;
          num_rejected: number;
          num_withdrawn: number;
          num_at_stage_0: number;
          num_at_stage_1: number;
          num_at_stage_2: number;
          num_at_stage_3: number;
          num_in_pipeline: number;
        };
      };
      candidate_applications_summary: {
        Row: {
          user_id: string;
          email: string;
          full_name: string | null;
          application_id: string;
          job_profile_id: string;
          application_status: string;
          current_stage_index: number | null;
          invited_at: string | null;
          applied_at: string | null;
          rejected_at: string | null;
          offered_at: string | null;
          withdrawn_at: string | null;
          application_created_at: string;
          job_title: string;
          job_company_name: string;
          job_category: string | null;
          job_seniority: string;
          job_publish_state: string;
        };
      };
      employer_jobs_summary: {
        Row: {
          employer_id: string;
          employer_email: string;
          company_name: string;
          employer_full_name: string | null;
          job_profile_id: string;
          title: string;
          category: string | null;
          publish_state: string;
          job_created_at: string;
          total_applications: number;
          num_rejected: number;
          num_offered: number;
          num_in_interview: number;
          num_applied: number;
        };
      };
    };
  };
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('SUPABASE_URL is not set. Database features will be disabled.');
}

export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// For server-side / route handlers where a service role key is available.
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase server client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false
    }
  });
};

