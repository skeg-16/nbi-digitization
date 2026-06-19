const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' }); // Ensure it loads from web/.env or web/.env.local

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const agents = [
  "AGT MARIA INNAH S. MONTALA",
  "SRA EDGAR T. DIGMAN",
  "AGT CARLO D. PANESARES",
  "SRA REX RANDOLF M. PIOY",
  "AGT HEINZ JAYSHREE O. LAFORTEZA",
  "AGT JOHN MICHAEL L. CAMBUSA",
  "AGT JON PAUL F. BUADA",
  "AGT EDGAR M. APOLONIO",
  "AGT RODOLFO R. SALES III",
  "SI JAY F. SALANGUSTE",
  "AGT JEZZRYL BLAS P. SAUALBIO",
  "AGT ARA FAUSTO MAUHAY"
];

const DEFAULT_PASSWORD = "NBI@2026"; // As requested or default

async function createAgentAccounts() {
  console.log('Starting agent account creation...');

  for (const agent of agents) {
    // Generate a standardized email based on the name
    const cleanName = agent.replace(/^(AGT|SRA|SI)\s+/, '').replace(/\./g, '').trim().toLowerCase();
    const parts = cleanName.split(/\s+/);
    
    // Use first and last part to make email: e.g. "maria.montala@nbi.gov.ph"
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const username = `${firstName}.${lastName}`;
    const email = `${username}@nbi.gov.ph`;

    console.log(`Creating account for: ${agent}`);
    console.log(`  -> Username: ${username}`);

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: agent,
          username: username
        }
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`  -> Account already exists for ${username}`);
        } else {
          console.error(`  -> Error creating ${username}:`, error.message);
        }
      } else {
        console.log(`  -> Success! Created user ID: ${data.user.id}`);
      }
    } catch (err) {
      console.error(`  -> Failed to create ${username}:`, err.message);
    }
  }
  
  console.log('\nAccount creation finished.');
  console.log('Default Password for all agents is:', DEFAULT_PASSWORD);
}

createAgentAccounts();
