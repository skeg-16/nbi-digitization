import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  try {
    const supabaseUserClient = await createClient();
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract last name for backward compatibility with old manually-typed records (e.g. "AGT.MI.MONTALA")
    const agentName = user.user_metadata?.name || '';
    const lastName = agentName ? agentName.split(' ').pop() : user.email;

    // STRICT ISOLATION via API: Use supabaseAdmin to bypass RLS for old records, but forcefully filter
    let query = supabaseAdmin
      .from('complaints')
      .select('*')
      .or(`user_id.eq.${user.id},agent_on_case.ilike.%${lastName}%`)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
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
  try {
    const data = await request.json();
    if (data.date_received === '') data.date_received = null;

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Automatically inject the user_id of the agent creating the record
    data.user_id = user.id;
    // Force the agent_on_case text to exactly match the logged-in user
    data.agent_on_case = user.user_metadata?.name || user.email;

    const { data: newRecord, error } = await supabase
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
