'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const rawUsername = formData.get('username')?.trim()?.toLowerCase();
  // Automatically append the default domain if they just typed their username
  const email = rawUsername.includes('@') ? rawUsername : `${rawUsername}@nbi.gov.ph`;

  const data = {
    email: email,
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
