'use client'

import { useState } from 'react'
import Image from 'next/image'
import { login } from './actions'
import ThemeToggle from '../../components/ThemeToggle'

export default function LoginPage() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)

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
    <div className="min-h-screen bg-[var(--bg-color)] bg-grid-pattern flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <ThemeToggle className="absolute top-6 right-6 z-50" />
      {/* Subtle Radial Gradient Overlay to give depth to the grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-color)]/50 to-[var(--bg-color)] pointer-events-none"></div>
      
      <div className="max-w-[480px] w-full bg-[var(--panel-bg)] shadow-2xl border border-[var(--border-color)] rounded-3xl p-10 relative z-10 animate-fade-in">
        
        {/* Logos Section */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className="relative w-16 h-16 transform hover:scale-105 transition-transform duration-300 drop-shadow-md">
            <Image src="/nbi.png" alt="NBI Logo" fill className="object-contain" priority />
          </div>
          <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-[var(--border-heavy)] to-transparent opacity-50"></div>
          <div className="relative w-16 h-16 transform hover:scale-105 transition-transform duration-300 drop-shadow-md">
            <Image src="/ccd.png" alt="CCD Logo" fill className="object-contain" priority />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--nbi-gold)] drop-shadow-sm">System Login</h1>
          <p className="text-[var(--text-muted)] font-medium text-sm">Sign in to access your official records workspace.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 rounded-lg text-sm font-medium animate-fade-in shadow-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input
                name="username"
                type="text"
                required
                className="form-input w-full pr-4 py-3 rounded-xl focus:border-[var(--nbi-gold)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-all outline-none font-medium placeholder-gray-500"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="e.g. maria.montala"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="form-input w-full pr-12 py-3 rounded-xl focus:border-[var(--nbi-gold)] focus:ring-2 focus:ring-[var(--focus-ring)] transition-all outline-none font-medium placeholder-gray-500"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--nbi-blue)] focus:ring-[var(--focus-ring)] transition-colors" />
              <span className="text-[var(--text-muted)] font-medium group-hover:text-[var(--text-main)] transition-colors">Remember me</span>
            </label>
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)} 
              className="font-semibold text-[var(--nbi-gold)] hover:text-[var(--nbi-blue)] transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-formal btn-primary py-4 mt-2 justify-center text-lg font-bold shadow-xl shadow-[var(--focus-ring)] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden rounded-xl"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Secure Login
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer Meta */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center">
          <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">National Bureau of Investigation</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">Cybercrime Division • Internal Use Only</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-color)] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[var(--nbi-gold)]/20 relative">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Access Restricted</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                For security reasons, self-service password resets are disabled for internal systems. 
                <br/><br/>
                Please contact the Cybercrime Division IT Administrator directly to request a password reset or account recovery.
              </p>
              
              <button 
                onClick={() => setShowForgotModal(false)}
                className="w-full mt-4 btn-formal btn-primary py-3 justify-center text-base font-bold rounded-xl"
              >
                Understood, close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
