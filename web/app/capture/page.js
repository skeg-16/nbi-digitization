'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { extractFields } from '../../lib/extractFields';
import { supabase } from '../../lib/supabase';

export default function CapturePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
      }
    });
  }, [router]);

  const handleCapture = async (event) => {
    if (!session) return;
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const ocrResult = await response.json();
      
      if (ocrResult.data) {
        const extracted = extractFields(ocrResult.data);
        sessionStorage.setItem('extractedData', JSON.stringify(extracted));
        router.push('/review');
      } else {
        throw new Error('No data received from OCR');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during OCR processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[var(--panel-bg)] rounded-2xl shadow-2xl p-10 space-y-8 text-center border border-[var(--border-color)] animate-fade-in relative z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-[var(--nbi-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--nbi-blue)]">Scan Form</h1>
          <p className="text-[var(--text-muted)] font-medium text-sm">Take a clear photo of the physical form to auto-extract the core fields.</p>
        </div>
        
        {error && <div className="text-[var(--red)] text-sm font-medium bg-red-50/50 border border-red-200 p-4 rounded-xl">{error}</div>}
        
        <div className="relative mt-8">
          <label 
            htmlFor="cameraInput" 
            className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all cursor-pointer group
              ${loading ? 'bg-gray-50 border-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-50/30 border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-[var(--nbi-blue)]'}`}
          >
            {loading ? (
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 animate-spin mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="font-semibold text-sm">Processing Image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-blue-600 group-hover:text-blue-700">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span className="font-bold text-sm tracking-wide">TAP TO OPEN CAMERA</span>
              </div>
            )}
          </label>
          <input 
            type="file" 
            id="cameraInput" 
            accept="image/*" 
            capture="environment" 
            className="hidden"
            onChange={handleCapture}
            disabled={loading}
          />
        </div>
        <button className="btn-formal w-full justify-center mt-6 py-3 hover:bg-gray-50" onClick={() => router.push('/')} disabled={loading}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
