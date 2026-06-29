import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();
    
    if (data.date_received === '') data.date_received = null;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Prevent malicious or accidental edits to the agent_on_case field
    const isManager = user?.user_metadata?.role === 'manager';
    if (user && !isManager) {
      data.agent_on_case = user.user_metadata?.name || user.email;
    }

    // Strip read-only or strictly protected fields before updating
    delete data.id;
    delete data.created_at;
    delete data.user_id;

    const { data: updatedRecord, error } = await supabase
      .from('complaints')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log update
    if (user) {
      await supabaseAdmin.from('audit_logs').insert([{
        record_id: id,
        agent_name: user.user_metadata?.name || user.email,
        action_type: 'UPDATE',
        details: { message: 'Record updated.', updated_fields: data }
      }]);
    }

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const supabase = await createClient();

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const { data: { user } } = await supabase.auth.getUser();

    // Log delete
    if (user) {
      await supabaseAdmin.from('audit_logs').insert([{
        record_id: id,
        agent_name: user.user_metadata?.name || user.email,
        action_type: 'DELETE',
        details: { message: 'Record deleted.' }
      }]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
