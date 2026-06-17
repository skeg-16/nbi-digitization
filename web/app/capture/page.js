'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractFields } from '../../lib/extractFields';

export default function CapturePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
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

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--panel-bg)] rounded-xl shadow p-8 space-y-6 text-center border border-[var(--border-color)]">
        <h1 className="text-2xl font-bold" style={{ color: "var(--nbi-blue)" }}>Scan Complaint Form</h1>
        <p className="text-[var(--text-muted)] text-sm">Take a clear photo of the physical form to auto-extract the 12 fields.</p>
        
        {error && <div className="text-[var(--red)] text-sm bg-red-50 p-3 rounded">{error}</div>}
        
        <div className="relative mt-8">
          <label 
            htmlFor="cameraInput" 
            className={`flex items-center justify-center w-full h-16 rounded-lg font-medium transition-all cursor-pointer
              ${loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'btn-primary'}`}
          >
            {loading ? 'Processing Image...' : 'Open Camera'}
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
        <button className="btn-formal w-full justify-center mt-4" onClick={() => router.push('/')}>Back to Home</button>
      </div>
    </div>
  );
}
