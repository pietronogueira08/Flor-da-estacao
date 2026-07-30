const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env variables manually since dotenv is missing
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, criado_em, status, order_items(count)')
    .order('criado_em', { ascending: false })
    .limit(5);
  
  if (error) console.error(error);
  else console.log(JSON.stringify(orders, null, 2));

  // Check the last order items if it has 0 items to see what was sent in the request maybe? 
  // We don't have the request body saved anywhere. But we can check variants.
}

check();
