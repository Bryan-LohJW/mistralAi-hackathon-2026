import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-80px] right-[5%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[110px]" />
      </div>
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <Link href="/" className="flex items-center gap-2 mb-8 group relative">
        <div className="p-2 bg-blue-600 rounded-xl text-white group-hover:scale-105 transition-transform shadow-lg shadow-blue-600/40">
          <Shield className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">AegisHire</span>
      </Link>

      <div className="w-full max-w-md relative">
        {children}
      </div>
    </div>
  );
}
