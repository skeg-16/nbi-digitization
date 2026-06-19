import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  try {
    let query = supabaseAdmin.from('complaints').select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      // Case-insensitive search on complainant, subject, and ccd_no
      query = query.or(`complainant.ilike.%${search}%,subject.ilike.%${search}%,ccd_no.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    // Prevent empty string from breaking Postgres date type
    if (data.date_received === '') data.date_received = null;

    // Attach the record to the agent
    data.agent_id = user.id;

    const { data: newRecord, error } = await supabaseAdmin
      .from('complaints')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: newRecord });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
