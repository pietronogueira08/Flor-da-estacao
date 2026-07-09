const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
let URL = '';
let KEY = '';

env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) KEY = line.split('=')[1].trim();
});

const supabase = createClient(URL, KEY);

async function checkTables() {
  const { data, error } = await supabase.from('form_submissions').select('*');
  console.log('form_submissions:', data);
  const { data: leads, error: e2 } = await supabase.from('leads').select('*');
  console.log('leads:', leads);
  const { data: contacts, error: e3 } = await supabase.from('contacts').select('*');
  console.log('contacts:', contacts);
  const { data: depo, error: e4 } = await supabase.from('depoimentos').select('*');
  console.log('depoimentos:', depo);
}
checkTables();
