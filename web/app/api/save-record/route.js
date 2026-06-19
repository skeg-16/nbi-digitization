import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Ensure empty strings for date are converted to null to prevent postgres errors
    if (data.date_received === '') {
      data.date_received = null;
    }

    const { error } = await supabaseAdmin
      .from('complaints')
      .insert([
        {
          record_no: data.record_no,
          date_received: data.date_received,
          ccd_no: data.ccd_no,
          nbi_ccn: data.nbi_ccn,
          nature_of_case: data.nature_of_case,
          complainant: data.complainant,
          subject: data.subject,
          agent_on_case: data.agent_on_case,
          age_gender: data.age_gender,
          contact_no: data.contact_no,
          status: data.status,
          re_assigned: data.re_assigned
        }
      ]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error saving record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
