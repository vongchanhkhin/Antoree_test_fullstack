import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Roles
  await prisma.role.createMany({
    data: [
      { id: 'learner', description: 'Students learning English' },
      { id: 'teacher', description: 'English teachers and instructors' },
      { id: 'moderator', description: 'Content moderators' },
      { id: 'admin', description: 'System administrators' },
    ],
    skipDuplicates: true,
  });

  // Seed Levels (A1 to C2)
  await prisma.level.createMany({
    data: [
      { id: 'A1', orderNo: 1 },
      { id: 'A2', orderNo: 2 },
      { id: 'B1', orderNo: 3 },
      { id: 'B2', orderNo: 4 },
      { id: 'C1', orderNo: 5 },
      { id: 'C2', orderNo: 6 },
    ],
    skipDuplicates: true,
  });

  // Seed Skills
  await prisma.skill.createMany({
    data: [
      { id: 'reading' },
      { id: 'listening' },
      { id: 'speaking' },
      { id: 'writing' },
      { id: 'vocab' },
      { id: 'grammar' },
    ],
    skipDuplicates: true,
  });

  // Create sample badges
  await prisma.badge.createMany({
    data: [
      {
        code: 'first_post',
        name: 'First Post',
        description: 'Created your first post',
      },
      {
        code: 'helpful_teacher',
        name: 'Helpful Teacher',
        description: 'Received 10 upvotes on posts',
      },
      {
        code: 'quiz_master',
        name: 'Quiz Master',
        description: 'Completed 50 quizzes',
      },
      {
        code: 'vocabulary_hero',
        name: 'Vocabulary Hero',
        description: 'Learned 1000 vocabulary words',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
