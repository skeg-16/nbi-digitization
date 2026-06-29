'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const [formData, setFormData] = useState({
    date_received: '', agent_on_case: '', ccd_no: '', 
    nbi_ccn: '', complainant: '', nature_of_case: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('extractedData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setFormData(prev => {
          const newData = { ...prev };
          for (const key in parsed) {
            if (key in newData) newData[key] = parsed[key] || '';
          }
          return newData;
        });
      } catch (e) {
        console.error('Failed to parse extracted data', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (process.env.NEXT_PUBLIC_WEB_ONLY_OCR === 'true') {
      try {
        const textToCopy = Object.entries(formData)
          .map(([k, v]) => `${formatLabel(k)}: ${v}`)
          .join('\n');
        await navigator.clipboard.writeText(textToCopy);
        alert('Extracted data copied to clipboard!');
        sessionStorage.removeItem('extractedData');
        router.push('/');
      } catch (err) {
        console.error('Failed to copy', err);
        alert('Could not copy data automatically. Please copy it manually.');
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/save-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save record');
      
      sessionStorage.removeItem('extractedData');
      router.push('/records');
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center p-4 py-12 px-6">
      <div className="max-w-3xl w-full bg-[var(--panel-bg)] rounded-2xl shadow-2xl border border-[var(--border-color)] p-10 space-y-8 animate-fade-in">
        <div className="border-b border-[var(--border-color)] pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--nbi-blue)]">Review Extracted Data</h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">Verify the 6 core fields below before finalizing the official case assignment.</p>
        </div>
        
        {error && <div className="text-[var(--red)] text-sm font-medium bg-red-50/50 border border-red-200 p-4 rounded-xl">{error}</div>}
        
        <form id="reviewForm" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => (
              <div key={key} className="flex flex-col group">
                <label className="form-label mb-2 text-sm font-bold text-[var(--text-main)] tracking-wide uppercase text-xs">
                  {formatLabel(key)}
                </label>
                <input
                  type={key === 'date_received' ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="form-input w-full transition-all duration-200"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-12 pt-6 border-t border-[var(--border-color)]">
            <button type="button" className="btn-formal hover:bg-gray-50" onClick={() => router.push('/')} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-formal btn-primary shadow-lg shadow-blue-900/20 px-8" disabled={loading}>
              {process.env.NEXT_PUBLIC_WEB_ONLY_OCR === 'true' 
                ? 'Copy Data' 
                : (loading ? 'Processing...' : 'Save Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
