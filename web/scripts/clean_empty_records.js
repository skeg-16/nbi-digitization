import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function cleanEmptyRecords() {
  console.log('Cleaning up empty records from the database...');
  
  // We want to delete records where ccd_no, nbi_ccn, complainant, and nature_of_case are all empty or null
  const { data: records, error } = await supabaseAdmin
    .from('complaints')
    .select('id, ccd_no, nbi_ccn, complainant, nature_of_case');

  if (error) {
    console.error('Error fetching records:', error);
    return;
  }

  const idsToDelete = records.filter(r => {
    const isE = (val) => val === null || val === undefined || val.trim() === '';
    return isE(r.ccd_no) && isE(r.nbi_ccn) && isE(r.complainant) && isE(r.nature_of_case);
  }).map(r => r.id);

  console.log(`Found ${idsToDelete.length} empty records.`);

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from('complaints')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting records:', deleteError);
    } else {
      console.log(`Successfully deleted ${idsToDelete.length} records.`);
    }
  } else {
    console.log('No empty records to delete.');
  }
}

cleanEmptyRecords();
