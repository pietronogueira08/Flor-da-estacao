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

async function fixData() {
  const productId = '3af90fe7-49cc-42a4-9296-a04a1aea7890';
  const orderId = '861cbfa0-07f4-42df-a3d8-f5b09d33245f';
  
  // 1. Create a variant for the real product
  const { data: variant, error: varErr } = await supabase.from('product_variants').insert({
    product_id: productId,
    tamanho: 'M',
    cor: 'Preto',
    sku: 'VEST-M-PR',
    estoque: 10,
    preco_override: null
  }).select('*').single();
  
  if (varErr) {
    console.error('Variant error:', varErr);
    return;
  }
  console.log('Created variant:', variant.id);
  
  // 2. Create an image for the real product
  await supabase.from('product_images').insert({
    product_id: productId,
    url: '/prod-vestido.png',
    posicao: 0,
    is_placeholder: true
  });
  
  // 3. Recreate the order item for the user's real order
  await supabase.from('order_items').insert({
    order_id: orderId,
    variant_id: variant.id,
    quantidade: 1,
    preco_unitario: 150
  });
  console.log('Fixed real data in DB!');
}
fixData();
