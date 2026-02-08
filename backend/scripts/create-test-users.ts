import { supabase } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

const testUsers = [
  // Admin user only
  { name: 'admin', email: 'admin@test.com', password: 'admin', roles: ['ADMIN'] },
  
  // Annotators - First list
  { name: 'annotator11', email: 'annotator11_theta@encord.ai', password: '11', roles: ['TRAINEE'] },
  { name: 'annotator14', email: 'annotator14_theta@encord.ai', password: '14', roles: ['TRAINEE'] },
  { name: 'annotator17', email: 'annotator17_theta@encord.ai', password: '17', roles: ['TRAINEE'] },
  { name: 'annotator24', email: 'annotator24_theta@encord.ai', password: '24', roles: ['TRAINEE'] },
  { name: 'annotator25', email: 'annotator25_theta@encord.ai', password: '25', roles: ['TRAINEE'] },
  { name: 'annotator26', email: 'annotator26_theta@encord.ai', password: '26', roles: ['TRAINEE'] },
  { name: 'annotator27', email: 'annotator27_theta@encord.ai', password: '27', roles: ['TRAINEE'] },
  { name: 'annotator28', email: 'annotator28_theta@encord.ai', password: '28', roles: ['TRAINEE'] },
  { name: 'annotator29', email: 'annotator29_theta@encord.ai', password: '29', roles: ['TRAINEE'] },
  { name: 'annotator30', email: 'annotator30_theta@encord.ai', password: '30', roles: ['TRAINEE'] },
  { name: 'annotator31', email: 'annotator31_theta@encord.ai', password: '31', roles: ['TRAINEE'] },
  { name: 'annotator32', email: 'annotator32_theta@encord.ai', password: '32', roles: ['TRAINEE'] },
  { name: 'annotator33', email: 'annotator33_theta@encord.ai', password: '33', roles: ['TRAINEE'] },
  { name: 'annotator34', email: 'annotator34_theta@encord.ai', password: '34', roles: ['TRAINEE'] },
  { name: 'annotator35', email: 'annotator35_theta@encord.ai', password: '35', roles: ['TRAINEE'] },
  { name: 'annotator36', email: 'annotator36_theta@encord.ai', password: '36', roles: ['TRAINEE'] },
  { name: 'annotator37', email: 'annotator37_theta@encord.ai', password: '37', roles: ['TRAINEE'] },
  { name: 'annotator38', email: 'annotator38_theta@encord.ai', password: '38', roles: ['TRAINEE'] },
  { name: 'annotator39', email: 'annotator39_theta@encord.ai', password: '39', roles: ['TRAINEE'] },
  
  // Annotators - Second list
  { name: 'annotator8', email: 'annotator8_theta@encord.ai', password: '8', roles: ['TRAINEE'] },
  { name: 'annotator9', email: 'annotator9_theta@encord.ai', password: '9', roles: ['TRAINEE'] },
  { name: 'annotator10', email: 'annotator10_theta@encord.ai', password: '10', roles: ['TRAINEE'] },
  { name: 'annotator12', email: 'annotator12_theta@encord.ai', password: '12', roles: ['TRAINEE'] },
  { name: 'annotator13', email: 'annotator13_theta@encord.ai', password: '13', roles: ['TRAINEE'] },
  { name: 'annotator15', email: 'annotator15_theta@encord.ai', password: '15', roles: ['TRAINEE'] },
  { name: 'annotator16', email: 'annotator16_theta@encord.ai', password: '16', roles: ['TRAINEE'] },
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
      // Check if user already exists by name (since email may be null)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, name')
        .eq('name', userData.name)
        .single();

      if (existingUser) {
        console.log(`⏭️  User "${userData.name}" already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // For @encord.ai users, set email to null (they'll login with name and enter email later)
      // For other users, keep the email
      const emailToUse = userData.email.endsWith('@encord.ai') ? null : userData.email;
      
      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: emailToUse,
          password: hashedPassword,
          name: userData.name,
          roles: userData.roles,
          isActive: true,
          currentDay: 1, // Using currentDay for now (will be migrated to currentSection)
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create ${userData.name}:`, error.message);
        continue;
      }

      const emailDisplay = emailToUse || '(email to be entered by user)';
      console.log(`✅ Created user: ${userData.name}`);
      console.log(`   Email: ${emailDisplay}`);
      console.log(`   Roles: ${userData.roles.join(', ')}`);
      console.log(`   Login: Name="${userData.name}", Password="${userData.password}"\n`);
    } catch (error: any) {
      console.error(`❌ Error creating ${userData.name}:`, error.message);
    }
  }

  console.log('✨ Users creation completed!');
  console.log('\n📋 Login Credentials (ALL USERS LOGIN WITH NAME):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Name: admin');
  console.log('  Password: admin');
  console.log('  Note: After first login, admin will be prompted to enter email\n');
  console.log('Annotators:');
  console.log('  Name: annotatorXX (where XX is the annotator ID number)');
  console.log('  Password: XX (just the ID number, e.g., "11", "38", "8")');
  console.log('  Note: After first login, each annotator will be prompted to enter their own email');
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
