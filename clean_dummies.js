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

async function cleanDummies() {
  // Fetch all products
  const { data: allProds, error: getErr } = await supabase.from('products').select('id');
    
  if (getErr) {
    console.error('Error fetching products:', getErr);
    return;
  }
  
  const dummyProds = allProds.filter(p => p.id.startsWith('b1000000'));
  console.log('Dummy products to delete:', dummyProds.length);
  
  for (const prod of dummyProds) {
    await supabase.from('product_variants').delete().eq('product_id', prod.id);
    await supabase.from('product_images').delete().eq('product_id', prod.id);
    await supabase.from('products').delete().eq('id', prod.id);
  }
  
  // Also delete dummy orders
  const { data: allOrders, error: getOrdersErr } = await supabase.from('orders').select('id');
    
  if (getOrdersErr) {
    console.error('Error fetching orders:', getOrdersErr);
  } else {
    const dummyOrders = allOrders.filter(o => o.id.startsWith('c1000000'));
    console.log('Dummy orders to delete:', dummyOrders.length);
    for (const order of dummyOrders) {
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
    }
  }

  console.log("All dummy data deleted successfully!");
}

cleanDummies();
