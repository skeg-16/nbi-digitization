'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '../lib/supabase/client';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const [agentName, setAgentName] = useState('Agent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      if (process.env.NEXT_PUBLIC_WEB_ONLY_OCR === 'true') {
        setAgentName('Guest Analyst');
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAgentName(user.user_metadata?.name || user.email.split('@')[0]);
      }
      setLoading(false);
    }
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] bg-grid-pattern flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <ThemeToggle className="absolute top-6 right-6 z-50" />
      {/* Subtle Radial Gradient Overlay to give depth to the grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-color)]/50 to-[var(--bg-color)] pointer-events-none"></div>

      <div className="max-w-3xl w-full bg-[var(--panel-bg)] backdrop-blur-2xl shadow-2xl border border-[var(--border-color)] rounded-3xl p-12 space-y-10 text-center animate-fade-in relative z-10">
        
        {/* Logos Section */}
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="relative w-24 h-24 transform hover:scale-105 transition-transform duration-300 drop-shadow-xl">
            <Image src="/nbi.png" alt="NBI Logo" fill className="object-contain" priority />
          </div>
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[var(--border-heavy)] to-transparent opacity-50"></div>
          <div className="relative w-24 h-24 transform hover:scale-105 transition-transform duration-300 drop-shadow-xl">
            <Image src="/ccd.png" alt="CCD Logo" fill className="object-contain" priority />
          </div>
        </div>
        
        {/* Branding Section */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-accent)] drop-shadow-sm">
            Cybercrime Division Database
          </h1>
          <p className="text-[var(--text-muted)] font-medium text-lg max-w-lg mx-auto leading-relaxed">
            {loading ? 'Initializing secure session...' : `Welcome back, ${agentName}. Access your official case assignments and operational records.`}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className={`grid gap-6 mt-10 ${process.env.NEXT_PUBLIC_WEB_ONLY_OCR === 'true' ? 'sm:grid-cols-1 max-w-sm mx-auto' : 'sm:grid-cols-2'}`}>
          {process.env.NEXT_PUBLIC_WEB_ONLY_OCR !== 'true' && (
            <Link href="/records" className="btn-formal w-full py-8 text-lg hover:bg-[var(--hover-translucent)] group rounded-2xl flex flex-col items-center justify-center gap-3 border border-[var(--border-color)] hover:border-[var(--nbi-gold)] transition-all bg-[var(--panel-translucent)]">
              <div className="p-4 bg-[var(--icon-circle-bg)] rounded-full shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-8 h-8 text-[var(--nbi-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-bold tracking-wide text-[var(--text-main)]">View Official Dashboard</span>
              <span className="text-sm font-normal text-[var(--text-muted)]">Search and manage records</span>
            </Link>
          )}
          
          <Link href="/capture" className="w-full py-8 text-lg group relative overflow-hidden rounded-2xl flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0b1d3a] to-[#1e3a8a] shadow-xl hover:shadow-[0_8px_30px_rgba(11,29,58,0.4)] transition-all hover:-translate-y-1 border border-[#2a4365]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-full group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 border border-white/10">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="relative z-10 font-extrabold tracking-wide text-white drop-shadow-md">Capture OCR Image</span>
            <span className="relative z-10 text-sm font-medium text-blue-100">Scan & Auto-Extract Data</span>
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="pt-8 mt-8 border-t border-[var(--border-color)] flex justify-between items-center text-sm text-[var(--text-muted)] font-medium">
          <span>Internal Cybercrime Division Access</span>
          <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full text-green-600 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Connection Secure
          </span>
        </div>
        
      </div>
    </div>
  );
}
