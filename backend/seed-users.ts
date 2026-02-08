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
      email: null, // Admin will enter email after first login
      password: 'admin',
      name: 'admin',
      roles: ['ADMIN'],
    },
    {
      email: null, // Mentor will enter email after first login
      password: 'mentor123',
      name: 'Mentor User',
      roles: ['MENTOR'],
    },
    {
      email: null, // Trainee will enter email after first login
      password: 'trainee123',
      name: 'Trainee User',
      roles: ['TRAINEE'],
    },
    {
      email: null, // Trainee will enter email after first login
      password: 'trainee123',
      name: 'Trainee User 2',
      roles: ['TRAINEE'],
    },
  ];

  for (const userData of users) {
    try {
      // Check if user exists by name (since email may be null)
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('name', userData.name)
        .single();

      if (existing) {
        console.log(`⏭️  User "${userData.name}" already exists, skipping...`);
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
        console.error(`❌ Error creating ${userData.name}:`, error.message);
      } else {
        console.log(`✅ Created ${userData.name} (${userData.roles.join(', ')})`);
      }
    } catch (error: any) {
      console.error(`❌ Error creating ${userData.name}:`, error.message);
    }
  }

  console.log('\n✨ Seed complete!');
  console.log('\n📋 Login Credentials (ALL USERS LOGIN WITH NAME):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Name: admin');
  console.log('  Password: admin');
  console.log('  Note: After first login, admin will be prompted to enter email');
  console.log('\nMentor:');
  console.log('  Name: Mentor User');
  console.log('  Password: mentor123');
  console.log('  Note: After first login, mentor will be prompted to enter email');
  console.log('\nTrainees:');
  console.log('  Name: Trainee User');
  console.log('  Password: trainee123');
  console.log('  Name: Trainee User 2');
  console.log('  Password: trainee123');
  console.log('  Note: After first login, each trainee will be prompted to enter email');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createUsers().catch(console.error);
