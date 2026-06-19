'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[var(--panel-bg)] shadow-2xl border border-[var(--border-color)] rounded-2xl p-10 space-y-8 text-center animate-fade-in relative z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 bg-[var(--nbi-blue)] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--nbi-blue)]">Official Records</h1>
          <p className="text-[var(--text-muted)] font-medium text-lg max-w-md">Streamline your case assignments by easily capturing and managing complaints.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-4">
            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : session ? (
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg inline-block border border-gray-100">
              Logged in as <span className="text-blue-700">{session.user.email}</span>
            </p>
            <div className="grid gap-4">
              <Link href="/capture" className="btn-formal btn-primary w-full py-4 justify-center text-base shadow-lg shadow-blue-900/20 group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Capture Document
              </Link>
              <Link href="/records" className="btn-formal w-full py-4 justify-center text-base bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                View Dashboard
              </Link>
              <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-800 font-medium mt-4 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 mt-8">
            <Link href="/login" className="btn-formal btn-primary w-full py-4 justify-center text-base shadow-lg shadow-blue-900/20 group">
              <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              Agent Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
