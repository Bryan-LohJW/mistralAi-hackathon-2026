export type StageType = 'behavioral' | 'technical coding' | 'case simulation' | 'leadership' | 'culture fit' | 'custom';

export interface StageConfig {
  id: string;
  type: StageType;
  focusAreas: string[];
  aiAllowed: boolean;
  voicePreset: string;
  scoringRubric: {
    weights: Record<string, number>;
    criteria: string[];
    passThreshold: number;
  };
  questions: { question: string; difficulty: 'easy' | 'medium' | 'hard' }[];
}

export interface JobProfile {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  mustHaveSkills: string[];
  stages: StageConfig[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  education: string;
  experienceSummary: string;
  resumeText: string;
  status: 'applied' | 'in_progress' | 'completed' | 'rejected' | 'passed';
  fitScore: number;
  fitJustification: string;
  matchedSkills: string[];
  missingSkills: string[];
  stageResults: Array<{
    stageId: string;
    score: number;
    answer: string;
    feedback: string;
    aiCollaborationAssessment?: string | null;
  }>;
}