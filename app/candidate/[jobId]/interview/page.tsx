
"use client";

import { useState, useEffect, use, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  Send, 
  MessageSquare, 
  Code, 
  Layout, 
  Lightbulb, 
  Zap, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  ChevronRight,
  Play,
  Terminal,
  FileText,
  Target,
  ListTodo,
  FileCheck,
  ClipboardCheck,
  ChevronLeft,
  Mic,
  MicOff,
  Square,
  Volume2,
  RefreshCcw,
  AudioLines,
  PhoneOff,
  Hand,
  Settings,
  MoreVertical,
  X,
  Info,
  StickyNote,
  User,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { generateEvaluationReport } from '@/ai/flows/generate-evaluation-report-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';

type StageStatus = 'not_started' | 'in_progress' | 'completed';

interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt?: string;
  constraints?: string[];
  objectives?: string[];
}

interface Stage {
  id: string;
  type: string;
  title: string;
  description: string;
  aiAllowed: boolean;
  voicePreset: string;
  questions: Question[];
}

export default function InterviewEngine({ params: paramsPromise }: { params: Promise<{ jobId: string }> }) {
  const params = use(paramsPromise);
  const jobId = params.jobId;
  const router = useRouter();
  const { toast } = useToast();
  
  // Stages Configuration
  const stages: Stage[] = useMemo(() => [
    {
      id: 'behavioral',
      type: 'behavioral',
      title: 'Behavioral & Experience',
      description: 'Experience-based questions to understand your professional background.',
      aiAllowed: false,
      voicePreset: 'Algenib',
      questions: [
        { id: 'b1', question: "Tell us about a time you had to lead a complex technical project under high pressure. What was the outcome?", difficulty: 'medium' }
      ]
    },
    {
      id: 'technical',
      type: 'technical coding',
      title: 'Technical Implementation',
      description: 'A deep dive into your coding ability and algorithmic thinking.',
      aiAllowed: true,
      voicePreset: 'Achernar',
      questions: [
        { 
          id: 't1', 
          question: "Longest Palindromic Substring", 
          difficulty: 'hard',
          prompt: "Write a function `longestPalindrome(s: string): string` that finds the longest palindromic substring in a given string `s`.",
          constraints: [
            "1 <= s.length <= 1000",
            "s consists of only digits and English letters."
          ]
        }
      ]
    },
    {
      id: 'case',
      type: 'case simulation',
      title: 'Case Study & Product',
      description: 'Real-world scenario analysis to evaluate your architectural thinking.',
      aiAllowed: true,
      voicePreset: 'Algenib',
      questions: [
        { 
          id: 'c1', 
          question: "Notification Service Scale-up", 
          difficulty: 'hard',
          prompt: "A client wants to scale their user base from 10k to 1M in 3 months. Design a high-level architecture for a notification service.",
          objectives: [
            "High availability and low latency",
            "Deduplication logic",
            "Cost optimization strategy"
          ]
        }
      ]
    }
  ], []);

  // State Management
  const [isJoined, setIsJoined] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>(['in_progress', 'not_started', 'not_started']);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'agenda' | 'notes' | 'ai-policy'>('agenda');
  const [meetingTime, setMeetingTime] = useState(0);
  const [isTranscriptDrawerOpen, setIsTranscriptDrawerOpen] = useState(false);
  
  // Response States
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
  const [codeExplanations, setCodeExplanations] = useState<Record<string, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<string, string>>({});
  const [caseResponses, setCaseResponses] = useState<Record<string, { main: string; assumptions: string; risks: string; recommendation: string }>>({});
  const [aiDeclarations, setAiDeclarations] = useState<Record<string, { used: boolean; justification: string }>>({});
  const [personalNotes, setPersonalNotes] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [isLoaded, setIsLoaded] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Voice States
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [questionAudio, setQuestionAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persistence: Load
  useEffect(() => {
    const saved = localStorage.getItem(`aegishire_interview_meet_${jobId}`);
    const rawAppData = localStorage.getItem(`aegishire_app_${jobId}`);
    
    if (rawAppData) {
      const data = JSON.parse(rawAppData);
      setAppData(data);
      if (data.formData?.name) setCandidateName(data.formData.name);
      if (data.candidateId) setCandidateId(data.candidateId);
      if (!data.fitResult || data.fitResult.fitScore < 40) {
        router.replace(`/candidate/${jobId}/apply`);
        return;
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentStageIdx(parsed.currentStageIdx || 0);
        setCurrentQuestionIdx(parsed.currentQuestionIdx || 0);
        setStageStatuses(parsed.stageStatuses || ['in_progress', 'not_started', 'not_started']);
        setAnswers(parsed.answers || {});
        setCodeAnswers(parsed.codeAnswers || {});
        setCodeExplanations(parsed.codeExplanations || {});
        setCodeOutputs(parsed.codeOutputs || {});
        setCaseResponses(parsed.caseResponses || {});
        setAiDeclarations(parsed.aiDeclarations || {});
        setMeetingTime(parsed.meetingTime || 0);
        setTimeLeft(parsed.timeLeft || 600);
        setIsReviewing(parsed.isReviewing || false);
        setIsJoined(parsed.isJoined || false);
      } catch (e) {
        console.error("Failed to load interview state", e);
      }
    }
    setIsLoaded(true);
  }, [jobId, router]);

  // Persistence: Save
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`aegishire_interview_meet_${jobId}`, JSON.stringify({
        currentStageIdx,
        currentQuestionIdx,
        stageStatuses,
        answers,
        codeAnswers,
        codeExplanations,
        codeOutputs,
        caseResponses,
        aiDeclarations,
        meetingTime,
        timeLeft,
        isReviewing,
        isJoined
      }));
    }
  }, [currentStageIdx, currentQuestionIdx, stageStatuses, answers, codeAnswers, codeExplanations, codeOutputs, caseResponses, aiDeclarations, meetingTime, timeLeft, jobId, isLoaded, isReviewing, isJoined]);

  // Timer & Meeting Clock
  useEffect(() => {
    if (!isLoaded || !isJoined || isReviewing) return;
    const timer = setInterval(() => {
      setMeetingTime(prev => prev + 1);
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoaded, isJoined, isReviewing]);

  const currentStage = stages[currentStageIdx];
  const currentQuestion = currentStage.questions[currentQuestionIdx];

  const handlePlayQuestion = async () => {
    if (questionAudio) {
      audioRef.current?.play();
      return;
    }

    setIsGeneratingVoice(true);
    try {
      const result = await textToSpeech({
        text: currentQuestion.question,
        voiceName: currentStage.voicePreset
      });
      setQuestionAudio(result.audioDataUri);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (error) {
      toast({ title: "Voice Error", description: "Failed to generate interviewer voice.", variant: "destructive" });
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const startRecording = async () => {
    if (isMicMuted) {
      toast({ title: "Microphone Muted", description: "Please unmute your microphone to start recording.", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          setIsTranscriptDrawerOpen(true);
          try {
            const result = await speechToText({ audioDataUri: base64Audio });
            const currentAnswer = answers[currentQuestion.id] || '';
            const newAnswer = currentAnswer ? `${currentAnswer}\n\n${result.transcript}` : result.transcript;
            setAnswers(prev => ({ ...prev, [currentQuestion.id]: newAnswer }));
          } catch (error) {
            toast({ title: "Transcription Failed", description: "Could not convert speech to text.", variant: "destructive" });
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({ title: "Microphone Error", description: "Could not access microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      const output = `> Running tests...\n> Test 1 (s="babad"): PASS\n> Test 2 (s="cbbd"): PASS\n> [SUCCESS] All cases passed.`;
      setCodeOutputs(prev => ({ ...prev, [currentQuestion.id]: output }));
      setIsRunningCode(false);
      toast({ title: "Code Executed", description: "Tests passed." });
    }, 1500);
  };

  const handleNext = () => {
    const stageType = currentStage.type;
    let canProceed = false;

    if (stageType === 'behavioral') canProceed = !!answers[currentQuestion.id]?.trim();
    if (stageType === 'technical coding') canProceed = !!codeAnswers[currentQuestion.id]?.trim();
    if (stageType === 'case simulation') canProceed = !!caseResponses[currentQuestion.id]?.main.trim();

    if (!canProceed) {
      toast({ title: "Response required", description: "Please provide a response before continuing.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setQuestionAudio(null);
      setIsTranscriptDrawerOpen(false);
      if (currentQuestionIdx < currentStage.questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setTimeLeft(600);
      } else {
        const newStatuses = [...stageStatuses];
        newStatuses[currentStageIdx] = 'completed';
        if (currentStageIdx < stages.length - 1) {
          newStatuses[currentStageIdx + 1] = 'in_progress';
          setCurrentStageIdx(prev => prev + 1);
          setCurrentQuestionIdx(0);
          setTimeLeft(600);
        } else {
          setIsReviewing(true);
        }
        setStageStatuses(newStatuses);
      }
      setIsSubmitting(false);
    }, 800);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const stageResults = stages.map(stage => {
        const q = stage.questions[0];
        let answer = '';
        if (stage.type === 'behavioral') answer = answers[q.id];
        if (stage.type === 'technical coding') answer = `${codeAnswers[q.id]}\n\nEXPLANATION:\n${codeExplanations[q.id]}`;
        if (stage.type === 'case simulation') {
          const res = caseResponses[q.id];
          answer = `${res.main}\n\nASSUMPTIONS:\n${res.assumptions}\n\nRISKS:\n${res.risks}`;
        }

        const decl = aiDeclarations[q.id];
        const artifacts = decl?.used ? [{
          prompt: "Candidate declared AI usage",
          aiResponse: "N/A",
          toolUsageNotes: decl.justification
        }] : null;

        return {
          stageId: stage.id,
          stageType: stage.type,
          question: q.question,
          candidateAnswer: answer,
          aiAllowed: stage.aiAllowed,
          aiInteractionArtifacts: artifacts
        };
      });

      const input = {
        jobProfile: {
          title: 'Senior Software Engineer',
          company: 'TechFlow Inc.',
          description: 'Frontend leader with React/Next.js expertise.',
          seniority: 'Senior',
          mustHaveSkills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
          interviewPipelineConfig: stages.map(s => ({
            stageId: s.id,
            stageType: s.type,
            focusAreas: ['Technical', 'Communication'],
            aiAllowed: s.aiAllowed
          }))
        },
        candidateData: {
          name: appData.formData.name,
          email: appData.formData.email,
          education: appData.formData.education,
          experienceSummary: appData.formData.experience,
          resumeText: appData.formData.resumeText
        },
        resumeFitCheckResult: {
          fitScore: appData.fitResult.fitScore,
          matchedSkills: appData.fitResult.matchedSkills,
          missingSkills: appData.fitResult.missingSkills,
          justification: appData.fitResult.justification
        },
        stageResults
      };

      await generateEvaluationReport(input);

      // Persist final interview results to the database
      if (candidateId) {
        try {
          await fetch('/api/candidates', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId,
              stageResults,
              status: 'completed'
            })
          });
        } catch (err) {
          console.error('Failed to update candidate with stage results', err);
        }
      }

      localStorage.removeItem(`aegishire_interview_meet_${jobId}`);
      localStorage.setItem(`aegishire_completed_${jobId}`, new Date().toISOString());
      router.push(`/candidate/${jobId}/completed`);
    } catch (error) {
      toast({ title: "Submission Error", description: "We couldn't submit your responses.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isLoaded) return <div className="h-screen flex items-center justify-center bg-muted/20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  // --- JOIN SCREEN ---
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center p-6 text-white">
        <div className="max-w-4xl w-full grid md:grid-cols-[1fr_350px] gap-12 items-center">
          <div className="space-y-8">
            <div className="aspect-video bg-[#3c4043] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/10">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/30">
                {candidateName.charAt(0)}
              </div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button variant="secondary" size="icon" className={cn("rounded-full", isMicMuted && "bg-destructive text-white hover:bg-destructive/80")} onClick={() => setIsMicMuted(!isMicMuted)}>
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </div>
              {!isMicMuted && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <div className="flex gap-0.5 items-end h-4">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-1 bg-green-500 animate-pulse" style={{ height: `${Math.random()*100}%` }} />)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4">
               <div className="text-center">
                 <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Interviewer</p>
                 <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-sm font-medium">Natalie (AI) - Ready</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Ready to join?</h1>
              <p className="text-muted-foreground">{currentStage.title} interview</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Shield className="w-4 h-4 text-primary" />
                <span>Identity Verified</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Volume2 className="w-4 h-4 text-primary" />
                <span>Audio: System Default</span>
              </div>
            </div>
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-full shadow-xl shadow-primary/20" onClick={() => {
              setIsJoined(true);
              handlePlayQuestion();
            }}>
              Join Now
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">Secured by AegisHire</p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN MEETING INTERFACE ---
  return (
    <div className="h-screen bg-[#202124] flex flex-col overflow-hidden text-white font-body">
      {/* Top Bar */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#202124] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold tracking-tight">AegisHire Interview</span>
          </div>
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400">TechFlow Inc. — Senior Software Engineer</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1.5 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                REC
              </Badge>
              {isTranscribing && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-0.5">
                  <AudioLines className="w-3 h-3 animate-bounce" />
                  Transcribing
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(meetingTime)}
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white border-0 py-1">
            Stage {currentStageIdx + 1}/{stages.length}: {currentStage.title}
          </Badge>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Stage Content Area (Meeting Tiles or Split-View) */}
        <div className={cn(
          "flex-1 flex flex-col gap-4 overflow-hidden relative transition-all duration-500",
          (currentStage.type === 'technical coding' || currentStage.type === 'case simulation') ? "xl:grid xl:grid-cols-[450px_1fr]" : ""
        )}>
          {/* Meeting Tiles Section */}
          <div className="flex flex-col gap-4 overflow-hidden min-h-[400px]">
            {/* Interviewer Tile (Large) */}
            <div className="flex-1 bg-[#3c4043] rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
              <div className={cn(
                "w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 transition-all duration-700",
                isGeneratingVoice ? "scale-110 border-primary shadow-[0_0_40px_rgba(46,92,161,0.4)]" : "scale-100"
              )}>
                <User className="w-16 h-16 text-primary/60" />
                {isGeneratingVoice && (
                   <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
                )}
              </div>
              
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-xl font-bold tracking-tight">Natalie (AI)</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isGeneratingVoice ? "bg-green-500" : "bg-gray-500")} />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {isGeneratingVoice ? "Speaking..." : isRecording ? "Listening..." : "Idle"}
                  </span>
                </div>
              </div>

              {/* Captions Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 text-center">
                 <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                   <p className="text-lg font-medium leading-relaxed">
                     {isGeneratingVoice ? <span className="text-gray-400 italic">Interviewer is speaking...</span> : currentQuestion.question}
                   </p>
                 </div>
              </div>

              {/* Speaker Waveform (Visual only) */}
              {isGeneratingVoice && (
                <div className="absolute bottom-32 flex gap-1 items-end h-8">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="w-1.5 bg-primary rounded-full animate-bounce" style={{ height: `${20 + Math.random()*80}%`, animationDelay: `${i*0.1}s` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Tile (PIP style or fixed) */}
            <div className="h-40 w-64 bg-[#3c4043] rounded-xl border border-white/20 absolute bottom-6 right-6 shadow-2xl z-10 flex flex-col items-center justify-center overflow-hidden group">
               <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/20">
                 {candidateName.charAt(0)}
               </div>
               <div className="absolute bottom-2 left-3 flex items-center gap-2">
                 {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5 text-green-500" />}
                 <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">You</span>
               </div>
               {isRecording && (
                 <div className="absolute top-2 right-3 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase text-red-500">Live</span>
                 </div>
               )}
            </div>
          </div>

          {/* Interactive Split Panels (Coding/Case) */}
          {(currentStage.type === 'technical coding' || currentStage.type === 'case simulation') && (
            <div className="bg-[#1e1e1e] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-500">
              <Tabs defaultValue="task" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 border-b border-white/5 flex items-center justify-between bg-[#282a2d]">
                  <TabsList className="bg-transparent h-12">
                    <TabsTrigger value="task" className="data-[state=active]:bg-white/5 text-white/60 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4">
                       <Target className="w-4 h-4 mr-2" /> Task Overview
                    </TabsTrigger>
                    {currentStage.type === 'technical coding' && (
                      <TabsTrigger value="editor" className="data-[state=active]:bg-white/5 text-white/60 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4">
                         <Code className="w-4 h-4 mr-2" /> solution.ts
                      </TabsTrigger>
                    )}
                    {currentStage.type === 'case simulation' && (
                      <TabsTrigger value="response" className="data-[state=active]:bg-white/5 text-white/60 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4">
                         <FileText className="w-4 h-4 mr-2" /> My Strategy
                      </TabsTrigger>
                    )}
                  </TabsList>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white"><Maximize2 className="w-4 h-4" /></Button>
                </div>

                <TabsContent value="task" className="flex-1 overflow-y-auto p-6 m-0">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold">{currentQuestion.question}</h3>
                       <p className="text-gray-300 leading-relaxed">{currentQuestion.prompt}</p>
                    </div>
                    {currentQuestion.constraints && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Constraints</p>
                        <ul className="text-sm space-y-1 text-gray-400">
                          {currentQuestion.constraints.map((c, i) => <li key={i} className="flex gap-2">• {c}</li>)}
                        </ul>
                      </div>
                    )}
                    {currentQuestion.objectives && (
                      <div className="grid gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Key Objectives</p>
                        {currentQuestion.objectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg text-sm border border-primary/10">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {obj}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="editor" className="flex-1 overflow-hidden m-0 flex flex-col">
                  <div className="flex-1 bg-[#1e1e1e] p-2 flex flex-col">
                    <div className="flex-1 rounded-lg overflow-hidden border border-white/10 flex flex-col">
                      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <span>TypeScript (Node 18)</span>
                        <div className="flex gap-4">
                           <span className="flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-green-500" /> Runtime Ready</span>
                           <span className="flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-primary" /> Auto-save ON</span>
                        </div>
                      </div>
                      <Textarea 
                        className="flex-1 bg-[#1e1e1e] text-green-400 font-code p-6 focus-visible:ring-0 border-0 resize-none"
                        placeholder="// Implement your solution here..."
                        value={codeAnswers[currentQuestion.id] || ''}
                        onChange={(e) => setCodeAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      />
                    </div>
                    {codeOutputs[currentQuestion.id] && (
                      <div className="h-32 mt-2 bg-black/40 rounded-lg p-3 font-code text-xs text-green-400 border border-white/5 overflow-y-auto">
                        <pre>{codeOutputs[currentQuestion.id]}</pre>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-[#282a2d] border-t border-white/5 flex justify-end gap-2">
                     <Button variant="outline" size="sm" className="bg-white/5 border-white/10" onClick={handleRunCode} disabled={isRunningCode}>
                       {isRunningCode ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Play className="w-3.5 h-3.5 mr-2" />}
                       Run Tests
                     </Button>
                  </div>
                </TabsContent>

                <TabsContent value="response" className="flex-1 overflow-y-auto p-6 m-0 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Architectural Strategy</Label>
                    <Textarea 
                      placeholder="Detail your system design..."
                      className="min-h-[250px] bg-white/5 border-white/10 text-white p-4"
                      value={caseResponses[currentQuestion.id]?.main || ''}
                      onChange={(e) => setCaseResponses(prev => ({ 
                        ...prev, 
                        [currentQuestion.id]: { ...(prev[currentQuestion.id] || { main: '', assumptions: '', risks: '', recommendation: '' }), main: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Assumptions</Label>
                       <Textarea 
                        className="bg-white/5 border-white/10 h-24"
                        value={caseResponses[currentQuestion.id]?.assumptions || ''}
                        onChange={(e) => setCaseResponses(prev => ({ 
                          ...prev, 
                          [currentQuestion.id]: { ...(prev[currentQuestion.id] || { main: '', assumptions: '', risks: '', recommendation: '' }), assumptions: e.target.value }
                        }))}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Key Risks</Label>
                       <Textarea 
                        className="bg-white/5 border-white/10 h-24"
                        value={caseResponses[currentQuestion.id]?.risks || ''}
                        onChange={(e) => setCaseResponses(prev => ({ 
                          ...prev, 
                          [currentQuestion.id]: { ...(prev[currentQuestion.id] || { main: '', assumptions: '', risks: '', recommendation: '' }), risks: e.target.value }
                        }))}
                       />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Sidebar Panel */}
        <aside className="w-[320px] bg-[#282a2d] rounded-2xl border border-white/5 overflow-hidden flex flex-col shrink-0 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="p-2 border-b border-white/5">
             <div className="flex bg-[#202124] rounded-xl p-1">
               <Button variant="ghost" size="sm" className={cn("flex-1 text-xs rounded-lg gap-1.5", activeSidebarTab === 'agenda' && "bg-[#3c4043] text-white")} onClick={() => setActiveSidebarTab('agenda')}>
                 <Layout className="w-3.5 h-3.5" /> Agenda
               </Button>
               <Button variant="ghost" size="sm" className={cn("flex-1 text-xs rounded-lg gap-1.5", activeSidebarTab === 'notes' && "bg-[#3c4043] text-white")} onClick={() => setActiveSidebarTab('notes')}>
                 <StickyNote className="w-3.5 h-3.5" /> Notes
               </Button>
               <Button variant="ghost" size="sm" className={cn("flex-1 text-xs rounded-lg gap-1.5", activeSidebarTab === 'ai-policy' && "bg-[#3c4043] text-white")} onClick={() => setActiveSidebarTab('ai-policy')}>
                 <Zap className="w-3.5 h-3.5" /> AI Policy
               </Button>
             </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {activeSidebarTab === 'agenda' && (
              <div className="space-y-4">
                {stages.map((s, idx) => (
                  <div key={s.id} className={cn(
                    "p-3 rounded-xl border transition-all duration-300",
                    idx === currentStageIdx ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(46,92,161,0.1)]" : "bg-white/5 border-white/5 opacity-50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Stage {idx + 1}</p>
                      {stageStatuses[idx] === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <h4 className="text-sm font-bold">{s.title}</h4>
                    {idx === currentStageIdx && (
                      <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-progress" style={{ width: '40%' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSidebarTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="w-4 h-4" />
                  <p className="text-xs font-medium">Private scratchpad</p>
                </div>
                <Textarea 
                  placeholder="Brainstorm your ideas here. These notes are not submitted." 
                  className="bg-white/5 border-white/10 h-[400px] text-sm leading-relaxed text-gray-300 placeholder:text-gray-600"
                  value={personalNotes}
                  onChange={e => setPersonalNotes(e.target.value)}
                />
              </div>
            )}

            {activeSidebarTab === 'ai-policy' && (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-xl border flex flex-col gap-3",
                  currentStage.aiAllowed ? "bg-accent/10 border-accent/20" : "bg-red-500/10 border-red-500/20"
                )}>
                  <div className="flex items-center gap-2">
                    <Zap className={cn("w-5 h-5", currentStage.aiAllowed ? "text-accent" : "text-red-500")} />
                    <h4 className="font-bold text-sm">
                      AI usage {currentStage.aiAllowed ? "is Allowed" : "is Strictly Prohibited"}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {currentStage.aiAllowed 
                      ? "You may use AI tools for brainstorming or verification. Please declare your usage below." 
                      : "Using AI tools during this stage will result in immediate disqualification."}
                  </p>
                </div>

                {currentStage.aiAllowed && (
                  <Card className="bg-white/5 border-white/10 overflow-hidden">
                    <CardHeader className="p-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="ai-used" 
                          checked={aiDeclarations[currentQuestion.id]?.used || false}
                          onCheckedChange={(checked) => setAiDeclarations(prev => ({ 
                            ...prev, 
                            [currentQuestion.id]: { ...(prev[currentQuestion.id] || { used: false, justification: '' }), used: !!checked } 
                          }))}
                        />
                        <label htmlFor="ai-used" className="text-xs font-medium leading-none cursor-pointer text-white">
                          I used AI assistance
                        </label>
                      </div>
                    </CardHeader>
                    {aiDeclarations[currentQuestion.id]?.used && (
                      <CardContent className="p-3 pt-0 animate-in slide-in-from-top-2">
                        <Textarea 
                          placeholder="How did you use AI?"
                          className="text-xs h-24 bg-black/20 border-white/5"
                          value={aiDeclarations[currentQuestion.id]?.justification || ''}
                          onChange={(e) => setAiDeclarations(prev => ({ 
                            ...prev, 
                            [currentQuestion.id]: { ...(prev[currentQuestion.id] || { used: true, justification: '' }), justification: e.target.value } 
                          }))}
                        />
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>

      {/* Transcript Review Drawer (Meet-like) */}
      {isTranscriptDrawerOpen && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center z-50 pointer-events-none px-6">
          <div className="max-w-3xl w-full bg-[#202124] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-8 pointer-events-auto">
             <div className="bg-[#282a2d] px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/20 rounded-lg"><Sparkles className="w-4 h-4 text-primary" /></div>
                  <h4 className="text-sm font-bold">Transcription Review</h4>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => setIsTranscriptDrawerOpen(false)}><X className="w-4 h-4" /></Button>
             </div>
             <div className="p-6 space-y-4">
                <div className="relative">
                   <Textarea 
                     className="bg-white/5 border-white/10 min-h-[150px] text-lg leading-relaxed text-gray-200 p-4 focus-visible:ring-primary"
                     value={answers[currentQuestion.id] || ''}
                     onChange={e => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                   />
                   {isTranscribing && (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-md">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="text-sm font-medium">Processing your speech...</span>
                        </div>
                     </div>
                   )}
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={() => {
                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: '' }));
                        startRecording();
                     }}>
                       <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Re-record
                     </Button>
                     <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={startRecording}>
                       <PlusIcon className="w-3.5 h-3.5 mr-2" /> Append
                     </Button>
                   </div>
                   <Button size="sm" className="px-6 font-bold" onClick={handleNext}>
                     Confirm & Send <Send className="w-3.5 h-3.5 ml-2" />
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <footer className="h-24 px-8 flex items-center justify-between bg-[#202124] shrink-0">
        <div className="flex items-center gap-2 w-[250px]">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{formatTime(meetingTime)} | Meet ID: aegis-772-910</p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" className={cn("h-12 w-12 rounded-full", isMicMuted && "bg-destructive text-white hover:bg-destructive/80")} onClick={() => setIsMicMuted(!isMicMuted)}>
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center gap-4 px-4 py-2 bg-[#3c4043] rounded-full border border-white/10">
            {isRecording ? (
              <Button variant="destructive" size="lg" className="rounded-full px-8 gap-2 animate-pulse h-12" onClick={stopRecording}>
                <Square className="w-5 h-5 fill-white" /> Stop Answer
              </Button>
            ) : (
              <Button size="lg" className="rounded-full px-8 gap-2 h-12 shadow-lg shadow-primary/20" onClick={startRecording} disabled={isTranscribing || isGeneratingVoice}>
                <Mic className="w-5 h-5" /> Start Speaking
              </Button>
            )}
            <Separator orientation="vertical" className="h-8 bg-white/10" />
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/60 hover:text-white" onClick={handlePlayQuestion}>
              <RefreshCcw className="w-5 h-5" />
            </Button>
          </div>

          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-[#3c4043] text-white hover:bg-white/10 border border-white/10">
            <Hand className="w-5 h-5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-[#3c4043] text-white hover:bg-white/10 border border-white/10">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 w-[250px]">
          <Button variant="destructive" className="rounded-full px-6 font-bold h-12 gap-2" onClick={() => setShowLeaveDialog(true)}>
             <PhoneOff className="w-4 h-4" /> End Interview
          </Button>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="bg-[#202124] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Leave Interview?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your progress is saved, but you will need to re-join to complete the remaining stages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="text-white hover:bg-white/5" onClick={() => setShowLeaveDialog(false)}>Stay</Button>
            <Button variant="destructive" onClick={() => router.push('/')}>Yes, Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <audio ref={audioRef} src={questionAudio || undefined} className="hidden" onPlay={() => setIsGeneratingVoice(true)} onEnded={() => setIsGeneratingVoice(false)} />
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
