import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { createClient } from '../../../lib/supabase/server';

export async function GET() {
  try {
    const supabaseUserClient = await createClient();
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers should be able to fetch the list of all agents
    const isManager = user.user_metadata?.role === 'manager';
    if (!isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get distinct agent names from the complaints table
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select('agent_on_case')
      .not('agent_on_case', 'is', null);

    if (error) throw error;
    
    // Deduplicate and sort the agent names
    const uniqueAgents = [...new Set(data.map(r => r.agent_on_case))].filter(Boolean).sort();
    
    return NextResponse.json({ success: true, data: uniqueAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
