"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Upload, FileCheck, AlertCircle, CheckCircle2, Loader2, ArrowRight, XCircle, ChevronRight, FileText, FileUp, Sparkles } from 'lucide-react';
import { performResumeFitCheck } from '@/ai/flows/perform-resume-fit-check';
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function CandidateApply({ params: paramsPromise }: { params: Promise<{ jobId: string }> }) {
  const params = use(paramsPromise);
  const jobId = params.jobId;
  const router = useRouter();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fitResult, setFitResult] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Submission, 2: Result/Gate
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    education: '',
    experience: '',
    resumeText: ''
  });

  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`aegishire_app_${jobId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setFitResult(parsed.fitResult || null);
        setStep(parsed.step || 1);
        if (parsed.candidateId) {
          setCandidateId(parsed.candidateId);
        }
      } catch (e) {
        console.error("Failed to load saved progress", e);
      }
    }
  }, [jobId]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`aegishire_app_${jobId}`, JSON.stringify({
      formData,
      fitResult,
      step,
      candidateId
    }));
  }, [formData, fitResult, step, jobId, candidateId]);

  // Mock job profile for fit check
  const jobProfile = {
    jobTitle: 'Senior Software Engineer',
    companyName: 'TechFlow Inc.',
    jobDescription: 'Frontend leader with React/Next.js expertise.',
    seniority: 'Senior',
    mustHaveSkills: ['React', 'TypeScript', 'Node.js', 'Next.js']
  };

  const processResumeContent = async (text: string) => {
    setIsAiProcessing(true);
    // Commented out AI extraction to bypass API errors
    /*
    try {
      const extracted = await extractResumeData({ resumeText: text });
      setFormData(prev => ({
        ...prev,
        name: extracted.name || prev.name,
        email: extracted.email || prev.email,
        education: extracted.education || prev.education,
        experience: extracted.experienceSummary || prev.experience,
        resumeText: text
      }));
      toast({ 
        title: "AI Analysis Complete", 
        description: "We've automatically pre-filled your profile information.",
      });
    } catch (error: any) {
      console.error("AI extraction failed", error);
    }
    */

    // Simulated Mock Extraction
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: "Alex Rivers",
        email: "alex.rivers@example.com",
        education: "MS in Computer Science, Stanford University",
        experience: "Senior Developer with 8 years of experience in full-stack engineering.",
        resumeText: text || "Mock resume content loaded."
      }));
      setIsAiProcessing(false);
      toast({ 
        title: "Extraction Complete", 
        description: "Mock information applied to unblock the prototype flow.",
      });
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({ title: "Invalid file type", description: "Please upload a PDF document.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setIsExtracting(true);
      
      // Simulate PDF parsing
      setTimeout(() => {
        const mockExtractedText = `NAME: Alex Rivers\nEMAIL: alex.rivers@example.com\nEDUCATION: MS in Computer Science, Stanford University.\nEXPERIENCE: 6 years as a Senior Software Engineer specializing in high-scale React applications at CloudScale Inc. Expert in Next.js and distributed systems.\nSKILLS: React, Next.js, TypeScript, Node.js, GraphQL, AWS.`;
        
        setFormData(prev => ({
          ...prev,
          name: "Alex Rivers",
          email: "alex.rivers@example.com",
          education: "MS in Computer Science, Stanford University",
          experience: "Senior Developer with 8 years of experience in full-stack engineering.",
          resumeText: mockExtractedText
        }));
        setIsExtracting(false);
        toast({ 
          title: "PDF Uploaded", 
          description: "Resume content loaded with mock data.",
        });
      }, 1500);
    }
  };

  const handleFitCheck = async () => {
    if (!formData.name || !formData.email || !formData.resumeText) {
      toast({ 
        title: "Information missing", 
        description: "Please fill in all required fields and provide your resume.", 
        variant: "destructive" 
      });
      return;
    }

    setIsAnalyzing(true);
    // Commented out AI fit check to bypass API errors
    /*
    try {
      const result = await performResumeFitCheck({
        jobProfile,
        resumeText: formData.resumeText
      });
      setFitResult(result);
      setStep(2);
    } catch (error) {
      toast({ title: "Analysis failed", description: "We couldn't analyze your resume.", variant: "destructive" });
    }
    */

    // Simulated Mock Fit Check + persist candidate to database
    setTimeout(async () => {
      const mockResult = {
        fitScore: 85,
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
        missingSkills: [],
        justification: "The candidate shows strong alignment with the technical requirements for this role based on their background in large-scale React applications."
      };

      setFitResult(mockResult);
      setStep(2);
      setIsAnalyzing(false);
      toast({ title: "Fit Check Complete", description: "Mock assessment applied." });

      try {
        const res = await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            formData,
            fitResult: mockResult
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.candidateId) {
            setCandidateId(json.candidateId);
          }
        } else {
          console.error('Failed to persist candidate');
        }
      } catch (err) {
        console.error('Error calling /api/candidates', err);
      }
    }, 1500);
  };

  const startInterview = () => {
    router.push(`/candidate/${jobId}/interview`);
  };

  const resetForm = () => {
    setFitResult(null);
    setStep(1);
    setSelectedFile(null);
    setFormData({
      name: '',
      email: '',
      education: '',
      experience: '',
      resumeText: ''
    });
    setCandidateId(null);
    localStorage.removeItem(`aegishire_app_${jobId}`);
  };

  // Determine eligibility status
  const getStatus = (score: number) => {
    if (score >= 70) return { label: 'Eligible', color: 'text-green-600', icon: <CheckCircle2 className="w-5 h-5" />, bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 40) return { label: 'Borderline', color: 'text-amber-600', icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'Not Eligible', color: 'text-destructive', icon: <XCircle className="w-5 h-5" />, bg: 'bg-destructive/5', border: 'border-destructive/20' };
  };

  const status = fitResult ? getStatus(fitResult.fitScore) : null;

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="px-6 h-16 flex items-center border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">AegisHire</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <span className={step === 1 ? "text-primary font-bold" : "text-muted-foreground"}>1. Resume Submission</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className={step === 2 ? "text-primary font-bold" : "text-muted-foreground"}>2. Fit Decision</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">3. Interview Stages</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{step === 1 ? "Start Your Application" : "Reviewing Your Fit"}</h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 
              ? "Submit your resume to unlock automated AI interview stages." 
              : "Our AI has completed an initial screening of your profile."}
          </p>
        </div>

        {step === 1 && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-primary" /> Resume Submission
                </CardTitle>
                <CardDescription>Upload your PDF resume. Our AI will automatically extract your professional details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="file" onValueChange={(val) => setUploadMethod(val as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="gap-2">
                      <FileUp className="w-4 h-4" /> Upload PDF
                    </TabsTrigger>
                    <TabsTrigger value="text" className="gap-2">
                      <FileText className="w-4 h-4" /> Paste Text
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="mt-4 space-y-4">
                    <div className="border-2 border-dashed rounded-xl p-10 text-center space-y-4 hover:border-primary/50 transition-colors bg-muted/5 relative">
                      {(isExtracting || isAiProcessing) && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                          <div className="relative">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <Sparkles className="w-4 h-4 text-accent absolute top-0 -right-2 animate-bounce" />
                          </div>
                          <p className="text-sm font-bold mt-4">
                            {isExtracting ? "Running OCR Detection..." : "AI Extracting Information..."}
                          </p>
                          <p className="text-xs text-muted-foreground px-10 text-center mt-1">This takes a few seconds as we parse your professional background.</p>
                        </div>
                      )}
                      
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF Document (Max 5MB)</p>
                      </div>
                      <Input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={isExtracting || isAiProcessing}
                      />
                      {selectedFile && !isExtracting && !isAiProcessing && (
                        <div className="pt-2 flex items-center justify-center gap-2">
                          <Badge variant="secondary" className="gap-1 py-1 px-3 bg-green-50 text-green-700 border-green-200">
                            <FileCheck className="w-3 h-3" />
                            {selectedFile.name}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedFile(null)}>Remove</Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                        <Label htmlFor="resume">Resume Text Content</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs gap-1.5" 
                          onClick={() => processResumeContent(formData.resumeText)}
                          disabled={!formData.resumeText || isAiProcessing}
                        >
                          {isAiProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
                          AI Extract Info
                        </Button>
                      </div>
                      <Textarea 
                        id="resume" 
                        placeholder="Paste your resume content here..." 
                        className="min-h-[250px] font-mono text-sm resize-none"
                        value={formData.resumeText}
                        onChange={e => setFormData({...formData, resumeText: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className={isAiProcessing ? "opacity-60 grayscale pointer-events-none transition-all" : "transition-all"}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  {isAiProcessing && (
                    <Badge variant="outline" className="animate-pulse bg-accent/5 text-accent border-accent/20">
                      AI Autofilling...
                    </Badge>
                  )}
                </div>
                <CardDescription>Verify the extracted information before running the fit check.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Alex Rivers" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="e.g. alex@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input 
                    id="education" 
                    placeholder="e.g. MS in Computer Science" 
                    value={formData.education}
                    onChange={e => setFormData({...formData, education: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Summary</Label>
                  <Textarea 
                    id="experience" 
                    placeholder="Briefly describe your professional background..." 
                    className="h-24 resize-none"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end bg-muted/30 pt-4 gap-3">
                <Button variant="ghost" asChild>
                  <Link href={`/candidate/${jobId}`}>Cancel</Link>
                </Button>
                <Button onClick={handleFitCheck} disabled={isAnalyzing || isExtracting || isAiProcessing || !formData.resumeText || !formData.name} className="gap-2 min-w-[200px] shadow-lg shadow-primary/20">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Role Fit...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      Submit & Run Fit Check
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {step === 2 && fitResult && status && (
          <div className="grid gap-6 animate-in zoom-in-95 duration-500">
            <Card className={`border-2 ${status.border} shadow-lg overflow-hidden`}>
              <div className={`h-1.5 ${status.bg} w-full`} />
              <CardHeader className={`${status.bg} pb-4`}>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className={`flex items-center gap-2 ${status.color}`}>
                      {status.icon} Fit Decision: {status.label}
                    </CardTitle>
                    <CardDescription>AI Assessment against {jobProfile.jobTitle} requirements</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className={`text-4xl font-black ${status.color}`}>{fitResult.fitScore}%</span>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Match Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rationale</Label>
                  <p className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-4 rounded-lg border">
                    {fitResult.justification}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Matched Skills
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {fitResult.matchedSkills.length > 0 ? (
                        fitResult.matchedSkills.map((s: string) => (
                          <Badge key={s} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                            {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No direct matches found.</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                      <AlertCircle className="w-3 h-3" /> Missing Key Skills
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {fitResult.missingSkills.length > 0 ? (
                        fitResult.missingSkills.map((s: string) => (
                          <Badge key={s} variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
                            {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Perfect skill alignment!</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6 border-t flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/10">
                {status.label === 'Not Eligible' ? (
                  <>
                    <p className="text-sm text-muted-foreground max-w-[400px] text-center sm:text-left">
                      Thank you for your interest in TechFlow Inc. At this time, your background doesn't match the specific requirements for this role.
                    </p>
                    <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                      Try with another profile
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground max-w-[400px] text-center sm:text-left">
                      Excellent! Your profile meets our requirements. You are now invited to proceed to the automated interview stages.
                    </p>
                    <Button size="lg" onClick={startInterview} className="gap-2 px-8 w-full sm:w-auto shadow-lg shadow-primary/20">
                      Proceed to Interview <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>

            {status.label === 'Not Eligible' && (
              <div className="text-center space-y-4 pt-10">
                <p className="text-sm text-muted-foreground">Want to learn more about how we assess candidates?</p>
                <div className="flex justify-center gap-4">
                  <Button variant="link" className="text-xs">Privacy Policy</Button>
                  <Button variant="link" className="text-xs">Assessment FAQ</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
