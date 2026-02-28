'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'employer' | 'candidate';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<Role>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role,
          company_name: role === 'employer' ? companyName || 'My Company' : undefined,
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      setLoading(false);
      router.push('/login?message=confirm_email');
      router.refresh();
      return;
    }
    const res = await fetch('/api/auth/sync', { method: 'POST', credentials: 'same-origin' });
    if (!res.ok) {
      setLoading(false);
      setError('Account created but could not complete setup. Try signing in.');
      return;
    }
    const { role: syncedRole } = await res.json();
    setLoading(false);
    router.push(syncedRole === 'employer' ? '/employer' : '/candidate');
    router.refresh();
  }

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-slate-400 mt-1 text-sm">Sign up and choose how you&apos;ll use AegisHire.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Role selector */}
        <div className="space-y-2">
          <Label className="text-slate-300 text-sm font-medium">I want to</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all text-center',
                role === 'candidate'
                  ? 'border-blue-500/70 bg-blue-500/10 text-blue-300'
                  : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20 hover:text-slate-300'
              )}
            >
              <User className="w-5 h-5" />
              <span className="font-medium text-sm">Find a job</span>
              <span className="text-xs opacity-70">Apply and interview</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all text-center',
                role === 'employer'
                  ? 'border-blue-500/70 bg-blue-500/10 text-blue-300'
                  : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20 hover:text-slate-300'
              )}
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-medium text-sm">Hire talent</span>
              <span className="text-xs opacity-70">Post jobs & manage</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-slate-300 text-sm font-medium">Full name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60 h-11"
          />
        </div>

        {role === 'employer' && (
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-slate-300 text-sm font-medium">Company name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60 h-11"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60 h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="bg-slate-800/60 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/60 h-11"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/30 font-semibold"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-slate-400 pt-1">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
