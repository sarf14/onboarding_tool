// Quick script to create admin user
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('🔧 Creating admin user...\n');

  try {
    // Check if admin exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', 'admin')
      .single();

    if (existing) {
      console.log('⚠️  Admin user already exists! Updating password...');
      const hashedPassword = await bcrypt.hash('admin', 10);
      const { error } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          roles: ['ADMIN'],
          isActive: true,
        })
        .eq('name', 'admin');

      if (error) {
        console.error('❌ Failed to update:', error.message);
        return;
      }
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin', 10);
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: 'admin',
          email: null,
          password: hashedPassword,
          roles: ['ADMIN'],
          isActive: true,
          currentDay: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create:', error.message);
        console.error('   Details:', error);
        return;
      }
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Name: admin');
    console.log('  Password: admin');
    console.log('  Role: ADMIN');
    console.log('\n✨ You can now login!');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

createAdmin().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
