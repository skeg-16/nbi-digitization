import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the fully functional Supabase CRUD dashboard
  redirect('/records');
}
