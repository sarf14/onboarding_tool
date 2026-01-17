import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createUsers() {
  console.log('🌱 Creating test users...\n');

  const users = [
    {
      email: 'admin@onboarding.com',
      password: 'admin123',
      name: 'Admin User',
      roles: ['ADMIN'],
    },
    {
      email: 'mentor@onboarding.com',
      password: 'mentor123',
      name: 'Mentor User',
      roles: ['MENTOR'],
    },
    {
      email: 'trainee@onboarding.com',
      password: 'trainee123',
      name: 'Trainee User',
      roles: ['TRAINEE'],
    },
    {
      email: 'trainee2@onboarding.com',
      password: 'trainee123',
      name: 'Trainee User 2',
      roles: ['TRAINEE'],
    },
  ];

  for (const userData of users) {
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existing) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          roles: userData.roles,
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      } else {
        console.log(`✅ Created ${userData.email} (${userData.roles.join(', ')})`);
      }
    } catch (error: any) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
  }

  console.log('\n✨ Seed complete!');
  console.log('\n📋 Test Users:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@onboarding.com');
  console.log('  Password: admin123');
  console.log('\nMentor:');
  console.log('  Email: mentor@onboarding.com');
  console.log('  Password: mentor123');
  console.log('\nTrainees:');
  console.log('  Email: trainee@onboarding.com');
  console.log('  Password: trainee123');
  console.log('  Email: trainee2@onboarding.com');
  console.log('  Password: trainee123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createUsers().catch(console.error);
