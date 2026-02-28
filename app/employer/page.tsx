import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, MoreVertical, Users, Briefcase, ExternalLink, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AuthNav } from '@/components/auth-nav';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { getEmployerIdForRequest } from '@/lib/employer-default';

async function getJobs(employerId: string) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: profiles, error } = await supabase
      .from('job_profiles')
      .select('*')
      .eq('employer_id', employerId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading job_profiles', error);
      return [];
    }

    const ids = (profiles ?? []).map((p) => p.id);
    if (ids.length === 0) return profiles ?? [];

    const { data: stages } = await supabase
      .from('job_stages')
      .select('job_profile_id')
      .in('job_profile_id', ids);

    const stageCountByJob = (stages ?? []).reduce<Record<string, number>>((acc, s) => {
      acc[s.job_profile_id] = (acc[s.job_profile_id] ?? 0) + 1;
      return acc;
    }, {});

    return (profiles ?? []).map((p) => ({
      ...p,
      stages: Array.from({ length: stageCountByJob[p.id] ?? 0 }, (_, i) => ({ index: i })),
    }));
  } catch (err) {
    console.error('Unexpected error loading jobs', err);
    return [];
  }
}

export default async function EmployerDashboard() {
  const employerId = await getEmployerIdForRequest();
  if (!employerId) redirect('/login?next=/employer');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const jobs = await getJobs(employerId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 h-16 flex items-center border-b border-white/10 bg-slate-950 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">AegisHire</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10" asChild>
            <Link href="/employer">Dashboard</Link>
          </Button>
          <AuthNav user={user} />
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage your interview pipelines and evaluate candidates.</p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-sm shadow-blue-600/20">
            <Link href="/employer/jobs/new">
              <Plus className="w-4 h-4" /> Create New Job Profile
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Total Candidates" value="20" icon={<Users className="w-4 h-4" />} />
            <StatCard title="Active Jobs" value="2" icon={<Briefcase className="w-4 h-4" />} />
            <StatCard title="Reports Generated" value="14" icon={<FileText className="w-4 h-4" />} />
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-slate-900">Recent Job Profiles</CardTitle>
                <CardDescription>Public share links are active for these pipelines.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="divide-y divide-slate-100">
                {jobs.length === 0 ? (
                  <div className="py-10 text-sm text-slate-400 text-center">
                    No job profiles yet. Create your first automated pipeline to get started.
                  </div>
                ) : (
                  jobs.map((job: any) => (
                    <div key={job.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{job.title}</h3>
                          <Badge variant={job.publish_state === 'published' ? 'default' : 'secondary'}>
                            {job.publish_state === 'published' ? 'Published' : job.publish_state === 'archived' ? 'Archived' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 0 candidates</span>
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {(job.stages || []).length} stages</span>
                          <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50" asChild>
                          <Link href={job.public_slug ? `/jobs/${job.public_slug}` : `/candidate/${job.id}`}>
                            <ExternalLink className="w-4 h-4 mr-2" /> Share Link
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50" asChild>
                          <Link href={`/employer/jobs/${job.id}`}>Manage</Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}