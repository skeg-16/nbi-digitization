import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function PUT(request, { params }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id = params.id;
    const data = await request.json();
    
    // Prevent empty string from breaking Postgres date type
    if (data.date_received === '') data.date_received = null;

    const { data: updatedRecord, error } = await supabaseAdmin
      .from('complaints')
      .update(data)
      .eq('id', id)
      .eq('agent_id', user.id) // Ensure they own it
      .select()
      .single();

    if (error) throw error;
    if (!updatedRecord) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id = params.id;
    
    const { error } = await supabaseAdmin
      .from('complaints')
      .delete()
      .eq('id', id)
      .eq('agent_id', user.id); // Ensure they own it

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
