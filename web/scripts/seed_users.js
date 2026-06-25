import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from web/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_PASSWORD = 'NBI-CCD-Default-2026!';

const users = [
  // MANAGERS (Staff)
  { name: 'Meliza Faith R. Espiritu', email: 'meliza.espiritu@nbi.gov.ph', role: 'manager' },
  { name: 'Rezy G. Mingo', email: 'rezy.mingo@nbi.gov.ph', role: 'manager' },
  { name: 'Jimmielyn DC. Barroles', email: 'jimmielyn.barroles@nbi.gov.ph', role: 'manager' },
  { name: 'Alexander P. Angeles', email: 'alexander.angeles@nbi.gov.ph', role: 'manager' },
  { name: 'Enrico H. Soria', email: 'enrico.soria@nbi.gov.ph', role: 'manager' },
  { name: 'Sapphaira Grazhel Y. Trivino', email: 'sapphaira.trivino@nbi.gov.ph', role: 'manager' },
  { name: 'Rachelle Joy M. Sucgang', email: 'rachelle.sucgang@nbi.gov.ph', role: 'manager' },
  { name: 'Darwin S. Veriña', email: 'darwin.verina@nbi.gov.ph', role: 'manager' },

  // AGENTS
  { name: 'SA Ruel G. Dugayon', email: 'ruel.dugayon@nbi.gov.ph', role: 'agent' },
  { name: 'SRA Christ Edgardo M. Añonuevo', email: 'christ.anonuevo@nbi.gov.ph', role: 'agent' },
  { name: 'SRA Edgar T. Digman', email: 'edgar.digman@nbi.gov.ph', role: 'agent' },
  { name: 'SRA Rex Randolf M. Pigy', email: 'rex.pigy@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Edgar M. Apolonio', email: 'edgar.apolonio@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Maria Innah S. Montala', email: 'maria.montala@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Rodolfo R. Sales III', email: 'rodolfo.sales@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Carlo G. Panesares', email: 'carlo.panesares@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Jon Paul F. Buada', email: 'jon.buada@nbi.gov.ph', role: 'agent' },
  { name: 'AGT John Michael L. Cambusa', email: 'john.cambusa@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Heinz Jayshree D. Laforteza', email: 'heinz.laforteza@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Jezzryl Blas P. Sualibio', email: 'jezzryl.sualibio@nbi.gov.ph', role: 'agent' },
  { name: 'AGT Ana Bianca L. Fausto-Mauhay', email: 'ana.fausto-mauhay@nbi.gov.ph', role: 'agent' },
  { name: 'SI Jay F. Balanguste', email: 'jay.balanguste@nbi.gov.ph', role: 'agent' }
];

async function seedUsers() {
  console.log(`Starting to seed ${users.length} users...`);

  for (const user of users) {
    console.log(`Processing ${user.name} (${user.email})...`);
    
    // Check if user already exists
    // Since we can't search by email easily with standard admin API without pagination, 
    // we'll just attempt to create, and handle the "already exists" error if necessary.
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role
      }
    });

    if (error) {
      if (error.message.includes('already exists') || error.status === 422) {
        console.log(`User ${user.email} already exists. Attempting to update metadata...`);
        // If they exist, we need to update their metadata instead.
        // First we must find their ID. We can list users.
        const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (!listError) {
          const existingUser = usersList.users.find(u => u.email === user.email);
          if (existingUser) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              user_metadata: {
                name: user.name,
                role: user.role
              }
            });
            if (updateError) {
              console.error(`Failed to update existing user ${user.email}:`, updateError.message);
            } else {
              console.log(`Successfully updated existing user ${user.email}.`);
            }
          }
        }
      } else {
        console.error(`Failed to create ${user.email}:`, error.message);
      }
    } else {
      console.log(`Successfully created ${user.email}.`);
    }
  }

  console.log('User seeding completed!');
}

seedUsers().catch(console.error);
