'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[var(--panel-bg)] shadow-2xl border border-[var(--border-color)] rounded-2xl p-10 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="h-16 w-16 bg-[var(--nbi-blue)] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--nbi-blue)]">Agent Login</h1>
          <p className="text-[var(--text-muted)] font-medium text-sm">Sign in to access your official records workspace.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="e.g. maria.montala"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-formal btn-primary py-4 justify-center text-base shadow-lg shadow-blue-900/20 disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
