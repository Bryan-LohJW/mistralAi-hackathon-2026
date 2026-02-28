"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Zap, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  Wifi, 
  Volume2, 
  Coffee,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CandidateLanding({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Mock job data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      // 5% chance of error for demo purposes
      if (Math.random() < 0.05) {
        setError(true);
      } else {
        setLoading(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const job = {
    title: 'Senior Software Engineer',
    company: 'TechFlow Inc.',
    location: 'Remote',
    description: 'We are looking for a world-class frontend engineer to lead our product development. You will be building highly interactive user interfaces using React and Next.js.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js'],
    estimatedTime: '45-60 mins',
    stages: [
      { id: '1', name: 'Resume Fit Check', status: 'not_started' },
      { id: '2', name: 'Behavioral & Experience', status: 'not_started' },
      { id: '3', name: 'Technical Implementation', status: 'not_started' },
      { id: '4', name: 'Case Study & Product', status: 'not_started' },
    ]
  };

  if (error) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8 shadow-xl">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Failed to load job details</h2>
          <p className="text-muted-foreground mb-6">We encountered an issue retrieving the interview profile. Please check your connection and try again.</p>
          <Button onClick={() => window.location.reload()} className="gap-2 w-full">
            <RefreshCcw className="w-4 h-4" /> Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b bg-white shadow-sm shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">AegisHire</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10">
        {loading ? (
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_350px] gap-8 animate-in fade-in duration-500">
            {/* Main Content Area */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="bg-primary/5 text-primary">Hiring via AegisHire AI</Badge>
                <h1 className="text-4xl font-extrabold tracking-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.company}</span>
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Full-time</span>
                </div>
              </div>

              {/* Welcome Panel */}
              <Card className="border-2 border-primary/5 overflow-hidden shadow-md">
                <div className="h-1.5 bg-primary w-full" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Welcome to your AI Interview</CardTitle>
                  <CardDescription className="text-lg">You have been invited to complete a multi-stage automated assessment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    AegisHire uses advanced artificial intelligence to conduct fair, efficient, and interactive interviews. This process allows you to showcase your skills through behavioral questions, technical simulations, and real-world scenarios.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 border flex items-start gap-3">
                      <div className="mt-1 text-primary"><Wifi className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Stable Connection</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Ensure you have a reliable internet link.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border flex items-start gap-3">
                      <div className="mt-1 text-primary"><Volume2 className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Quiet Workspace</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Find a distraction-free area to focus.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border flex items-start gap-3">
                      <div className="mt-1 text-primary"><Clock className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Dedicated Time</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Plan for about {job.estimatedTime} of work.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border flex items-start gap-3">
                      <div className="mt-1 text-primary"><Coffee className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-sm">Break Friendly</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">You can pause between major stages.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-primary/5 border-t p-6 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent fill-accent" />
                    Ready whenever you are.
                  </p>
                  <Button size="lg" className="px-10 h-12 text-lg font-bold gap-2 shadow-lg shadow-primary/20" asChild>
                    <Link href={`/candidate/${jobId}/apply`}>
                      Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Expectations Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">What to expect</h2>
                <div className="grid gap-3">
                  <ProcessStep 
                    number="1" 
                    title="Resume Fit Check" 
                    description="Our AI will instantly review your experience against the core requirements."
                  />
                  <ProcessStep 
                    number="2" 
                    title="Behavioral & Coding Stages" 
                    description="Answer experience-based questions and solve technical problems in our interactive workspace."
                  />
                  <ProcessStep 
                    number="3" 
                    title="Final Evaluation" 
                    description="A detailed AI-generated report will be sent to the hiring team at TechFlow Inc."
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Pipeline Area */}
            <div className="space-y-6">
              <Card className="sticky top-24 border-2 border-primary/10 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent fill-accent" />
                    Interview Pipeline
                  </CardTitle>
                  <CardDescription>Your progress across {job.stages.length} stages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {job.stages.map((stage, idx) => (
                    <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg group hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full border-2 border-muted bg-white flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 group-hover:border-primary/30 transition-colors">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{stage.name}</p>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase tracking-wider bg-white/50">
                          {stage.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-4 border-t px-6 flex flex-col gap-3">
                  <div className="w-full flex justify-between text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-primary transition-all duration-500" />
                  </div>
                </CardFooter>
              </Card>

              <div className="p-5 rounded-2xl bg-white border border-primary/10 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Shield className="w-5 h-5" />
                  <h4 className="text-sm">Secure Assessment</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AegisHire uses secure session management to protect your information and ensure a fair screening process. Your responses are stored safely.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 px-6 border-t bg-muted/30">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">AegisHire</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AegisHire Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProcessStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-4 p-5 rounded-xl bg-white border border-primary/5 group hover:border-primary/40 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
        {number}
      </div>
      <div className="space-y-1">
        <h4 className="font-bold flex items-center gap-2">
          {title}
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
