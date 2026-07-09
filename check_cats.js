const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
let URL = '';
let KEY = '';

env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) KEY = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && !KEY) KEY = line.split('=')[1].trim(); // fallback
});

const supabase = createClient(URL, KEY);

async function run() {
  // Update 2
  await supabase.from('categories').update({ nome: 'Blusas', slug: 'blusas' }).eq('id', 'a1000000-0000-0000-0000-000000000002');
  // Update 3
  await supabase.from('categories').update({ nome: 'Calças', slug: 'calcas' }).eq('id', 'a1000000-0000-0000-0000-000000000003');
  // Update 5
  await supabase.from('categories').update({ nome: 'Macacão', slug: 'macacao' }).eq('id', 'a1000000-0000-0000-0000-000000000005');
  // Update 6
  await supabase.from('categories').update({ nome: 'Short', slug: 'short' }).eq('id', 'a1000000-0000-0000-0000-000000000006');
  
  // Check if "Saia" exists
  const { data } = await supabase.from('categories').select('*').eq('slug', 'saia');
  if (!data || data.length === 0) {
    await supabase.from('categories').insert({
      id: 'a1000000-0000-0000-0000-000000000007',
      nome: 'Saia',
      slug: 'saia'
    });
  }
  
  console.log("DB Updated!");
}
run();
