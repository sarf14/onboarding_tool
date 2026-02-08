import { supabase } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');

  try {
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', 'admin')
      .single();

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Updating password...');
      
      // Update password
      const hashedPassword = await hashPassword('admin');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          roles: ['ADMIN'],
          isActive: true,
        })
        .eq('name', 'admin');

      if (updateError) {
        console.error('❌ Failed to update admin user:', updateError.message);
        return;
      }

      console.log('✅ Admin user password updated successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  Name: admin');
      console.log('  Password: admin');
      console.log('  Role: ADMIN');
      return;
    }

    // Create new admin user
    const hashedPassword = await hashPassword('admin');
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: 'admin',
        email: null, // Will be entered after first login
        password: hashedPassword,
        roles: ['ADMIN'],
        isActive: true,
        currentDay: 1,
      })
      .select('id, name, roles')
      .single();

    if (error) {
      console.error('❌ Failed to create admin user:', error.message);
      console.error('   Error details:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Name: admin');
    console.log('  Password: admin');
    console.log('  Role: ADMIN');
    console.log('\n💡 After first login, you will be prompted to enter your email address.');
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run if executed directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default createAdminUser;
