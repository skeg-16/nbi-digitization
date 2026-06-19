import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

const agents = [
  { name: "AGT MARIA INNAH S. MONTALA", email: "mmontala@nbi.gov.ph" },
  { name: "SRA EDGAR T. DIGMAN", email: "edigman@nbi.gov.ph" },
  { name: "AGT CARLO D. PANESARES", email: "cpanesares@nbi.gov.ph" },
  { name: "SRA REX RANDOLF M. PIOY", email: "rpioy@nbi.gov.ph" },
  { name: "AGT HEINZ JAYSHREE O. LAFORTEZA", email: "hlaforteza@nbi.gov.ph" },
  { name: "AGT JOHN MICHAEL L. CAMBUSA", email: "jcambusa@nbi.gov.ph" },
  { name: "AGT JON PAUL F. BUADA", email: "jbuada@nbi.gov.ph" },
  { name: "AGT EDGAR M. APOLONIO", email: "eapolonio@nbi.gov.ph" },
  { name: "AGT RODOLFO R. SALES III", email: "rsales@nbi.gov.ph" },
  { name: "SI JAY F. SALANGUSTE", email: "jsalanguste@nbi.gov.ph" },
  { name: "AGT JEZZRYL BLAS P. SAUALBIO", email: "jsaualbio@nbi.gov.ph" },
  { name: "AGT ARA FAUSTO MAUHAY", email: "amauhay@nbi.gov.ph" },
];

export async function GET() {
  const results = [];
  
  for (const agent of agents) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: agent.email,
      password: 'NBI-Password2026!',
      email_confirm: true,
      user_metadata: { full_name: agent.name }
    });
    
    if (error) {
      // Ignore "User already registered" errors in case they run it twice
      if (error.message.includes('already registered')) {
        results.push({ email: agent.email, status: 'Already Exists' });
      } else {
        results.push({ email: agent.email, status: 'Error', error: error.message });
      }
    } else {
      results.push({ email: agent.email, status: 'Success', id: data.user.id });
    }
  }

  return NextResponse.json({ 
    message: "Agent seeding complete. Once you have run this in development or production, please delete this file to secure the endpoint.",
    results 
  });
}
