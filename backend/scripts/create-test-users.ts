import { supabase } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

const testUsers = [
  // Admin user only
  { name: 'Admin User', email: 'admin@test.com', password: 'admin123', roles: ['ADMIN'] },
  
  // Annotators - First list
  { name: 'Akansha', email: 'annotator11_theta@encord.ai', password: 'annotator11', roles: ['TRAINEE'] },
  { name: 'Abhijit', email: 'annotator14_theta@encord.ai', password: 'annotator14', roles: ['TRAINEE'] },
  { name: 'Vinayak', email: 'annotator17_theta@encord.ai', password: 'annotator17', roles: ['TRAINEE'] },
  { name: 'Rajani Chouhan', email: 'annotator24_theta@encord.ai', password: 'annotator24', roles: ['TRAINEE'] },
  { name: 'Aayan Mulla', email: 'annotator25_theta@encord.ai', password: 'annotator25', roles: ['TRAINEE'] },
  { name: 'Anjali Auti', email: 'annotator26_theta@encord.ai', password: 'annotator26', roles: ['TRAINEE'] },
  { name: 'Khushi', email: 'annotator27_theta@encord.ai', password: 'annotator27', roles: ['TRAINEE'] },
  { name: 'Varsha Hulmani', email: 'annotator28_theta@encord.ai', password: 'annotator28', roles: ['TRAINEE'] },
  { name: 'Annotator 29', email: 'annotator29_theta@encord.ai', password: 'annotator29', roles: ['TRAINEE'] },
  { name: 'Shivam Lagdive', email: 'annotator30_theta@encord.ai', password: 'annotator30', roles: ['TRAINEE'] },
  { name: 'Annotator 31', email: 'annotator31_theta@encord.ai', password: 'annotator31', roles: ['TRAINEE'] },
  { name: 'Aastha Raina', email: 'annotator32_theta@encord.ai', password: 'annotator32', roles: ['TRAINEE'] },
  { name: 'Sameer Tadavi', email: 'annotator33_theta@encord.ai', password: 'annotator33', roles: ['TRAINEE'] },
  { name: 'Devendra Kawade', email: 'annotator34_theta@encord.ai', password: 'annotator34', roles: ['TRAINEE'] },
  { name: 'Shraddha Patel', email: 'annotator35_theta@encord.ai', password: 'annotator35', roles: ['TRAINEE'] },
  { name: 'Anjali Dongre', email: 'annotator36_theta@encord.ai', password: 'annotator36', roles: ['TRAINEE'] },
  { name: 'Purva Golegoankar', email: 'annotator37_theta@encord.ai', password: 'annotator37', roles: ['TRAINEE'] },
  { name: 'Sarfaraz', email: 'annotator38_theta@encord.ai', password: 'annotator38', roles: ['TRAINEE'] },
  { name: 'Mustafa', email: 'annotator39_theta@encord.ai', password: 'annotator39', roles: ['TRAINEE'] },
  
  // Annotators - Second list
  { name: 'Karan', email: 'annotator8_theta@encord.ai', password: 'annotator8', roles: ['TRAINEE'] },
  { name: 'Rahul', email: 'annotator9_theta@encord.ai', password: 'annotator9', roles: ['TRAINEE'] },
  { name: 'Snovia', email: 'annotator10_theta@encord.ai', password: 'annotator10', roles: ['TRAINEE'] },
  { name: 'Prathamesh', email: 'annotator12_theta@encord.ai', password: 'annotator12', roles: ['TRAINEE'] },
  { name: 'Annotator 13', email: 'annotator13_theta@encord.ai', password: 'annotator13', roles: ['TRAINEE'] },
  { name: 'Jay', email: 'annotator15_theta@encord.ai', password: 'annotator15', roles: ['TRAINEE'] },
  { name: 'Eknath', email: 'annotator16_theta@encord.ai', password: 'annotator16', roles: ['TRAINEE'] },
];

async function cleanupOldTestUsers() {
  console.log('🧹 Cleaning up old test users (mentors and trainees)...\n');
  
  const oldTestEmails = [
    'mentor1@test.com',
    'mentor2@test.com',
    'trainee1@test.com',
    'trainee2@test.com',
    'trainee3@test.com',
    'trainee4@test.com',
    'trainee5@test.com',
  ];

  for (const email of oldTestEmails) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('email', email);

      if (error) {
        console.log(`⚠️  Could not delete ${email}:`, error.message);
      } else {
        console.log(`🗑️  Deleted old user: ${email}`);
      }
    } catch (error: any) {
      console.log(`⚠️  Error deleting ${email}:`, error.message);
    }
  }
  
  console.log('');
}

async function createTestUsers() {
  console.log('🚀 Creating users...\n');
  
  // Clean up old test users first
  await cleanupOldTestUsers();

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          roles: userData.roles,
          isActive: true,
          currentDay: 1, // Using currentDay for now (will be migrated to currentSection)
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create ${userData.email}:`, error.message);
        continue;
      }

      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      console.log(`   Roles: ${userData.roles.join(', ')}`);
      console.log(`   Password: ${userData.password}\n`);
    } catch (error: any) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
  }

  console.log('✨ Users creation completed!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@test.com');
  console.log('  Password: admin123\n');
  console.log('Annotators:');
  console.log('  Email: annotatorXX_theta@encord.ai (where XX is the annotator number)');
  console.log('  Password: annotatorXX (where XX is the annotator number)');
  console.log(`\n  Total annotators created: ${testUsers.filter(u => u.roles.includes('TRAINEE')).length}`);
}

// Run if executed directly
if (require.main === module) {
  createTestUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default createTestUsers;
