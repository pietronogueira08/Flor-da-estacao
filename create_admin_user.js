const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
let URL = '';
let KEY = '';

env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) KEY = line.split('=')[1].trim();
});

if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdminUser() {
  const email = 'Zayalojadmin@zaya.com.br';
  const password = 'Joaquim160925';

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === email);
  
  if (existing) {
    console.log('User already exists, updating password...');
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) { console.error('Update error:', error); return; }
    console.log('✅ Admin user password updated!');
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin', name: 'Zaya Admin' }
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('✅ Admin user created!');
  console.log('   Email:', data.user.email);
  console.log('   ID:', data.user.id);
}

createAdminUser();
