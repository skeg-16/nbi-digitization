import { NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../../lib/supabase';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const supabaseUserClient = await createClient();
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('record_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
