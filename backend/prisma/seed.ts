import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@onboarding.com' },
    update: {},
    create: {
      email: 'admin@onboarding.com',
      password: adminPassword,
      name: 'Admin User',
      roles: ['ADMIN'],
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample mentor
  const mentorPassword = await hashPassword('mentor123');
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@onboarding.com' },
    update: {},
    create: {
      email: 'mentor@onboarding.com',
      password: mentorPassword,
      name: 'Mentor User',
      roles: ['MENTOR'],
    },
  });

  console.log('✅ Created mentor user:', mentor.email);

  // Create sample trainee
  const traineePassword = await hashPassword('trainee123');
  const trainee = await prisma.user.upsert({
    where: { email: 'trainee@onboarding.com' },
    update: {},
    create: {
      email: 'trainee@onboarding.com',
      password: traineePassword,
      name: 'Trainee User',
      roles: ['TRAINEE'],
      mentorId: mentor.id,
      programStartDate: new Date(),
      currentDay: 1,
    },
  });

  console.log('✅ Created trainee user:', trainee.email);

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Default credentials:');
  console.log('Admin: admin@onboarding.com / admin123');
  console.log('Mentor: mentor@onboarding.com / mentor123');
  console.log('Trainee: trainee@onboarding.com / trainee123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
