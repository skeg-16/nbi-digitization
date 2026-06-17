import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Prevent empty string from breaking Postgres date type
    if (data.date_received === '') data.date_received = null;

    const { data: updatedRecord, error } = await supabaseAdmin
      .from('complaints')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    const { error } = await supabaseAdmin
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
