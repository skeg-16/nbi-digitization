'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const [formData, setFormData] = useState({
    date_received: '', agent_on_case: '', ccd_no: '', 
    nbi_ccn: '', acmo_no: '', subject: '', 
    complainant: '', nature_of_case: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('extractedData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Only merge keys that exist in our 12 fields
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
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center p-4 py-10">
      <div className="max-w-2xl w-full bg-[var(--panel-bg)] rounded-xl shadow border border-[var(--border-color)] p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--nbi-blue)" }}>Review Extracted Data</h1>
        </div>
        
        <p className="text-[var(--text-muted)] text-sm mb-6">Verify the 12 extracted fields below before finalizing the official record.</p>
        
        {error && <div className="text-[var(--red)] text-sm bg-red-50 p-3 rounded">{error}</div>}
        
        <form id="reviewForm" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="form-label mb-1 text-sm font-semibold text-[var(--text-muted)]">
                  {formatLabel(key)}
                </label>
                {key === 'status' ? (
                  <select name={key} value={formData[key]} onChange={handleChange} className="form-select">
                    <option value="">Select Status</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Serving">Serving</option>
                    <option value="Served">Served</option>
                    <option value="Skipped">Skipped</option>
                    <option value="No-show">No-show</option>
                  </select>
                ) : (
                  <input
                    type={key === 'date_received' ? 'date' : 'text'}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="form-input"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-color)]">
            <button type="button" className="btn-formal" onClick={() => router.push('/')} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-formal btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
