const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, nome, product_variants(count)')
  
  if (error) {
    console.error(error);
    return;
  }
  
  const buggedProducts = products.filter(p => p.product_variants[0].count === 0);
  console.log(`Found ${buggedProducts.length} bugged products without variants:`);
  buggedProducts.forEach(p => console.log(`- ${p.nome} (ID: ${p.id})`));
}

check();
