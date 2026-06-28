import { PrismaClient, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TASK_POOL = [
  { title: "Complete task management dashboard", description: "Design and implement the main dashboard showing task completion statistics." },
  { title: "Write unit tests for authentication", description: "Increase test coverage for sign up, sign in, and token refresh endpoints." },
  { title: "Design landing page layout", description: "Create a modern, clean design for the landing page using Figma." },
  { title: "Review pull request for API integration", description: "Check code quality and functionality of the new integration branch." },
  { title: "Update database schema for subtasks", description: "Add a new relation to support hierarchical tasks in the database." },
  { title: "Configure CI/CD deployment pipeline", description: "Set up GitHub Actions to deploy the application on push to main." },
  { title: "Set up environment variables for production", description: "Ensure all secrets are properly configured in the hosting environment." },
  { title: "Refactor user authentication controller", description: "Clean up code and separate concerns in the auth controller." },
  { title: "Fix memory leak in websocket connections", description: "Investigate and resolve the websocket socket leakage issue." },
  { title: "Create documentation for API endpoints", description: "Write clear Swagger/OpenAPI documentation for all routes." },
  { title: "Optimize database queries for dashboard statistics", description: "Add appropriate indexes and rewrite slow queries." },
  { title: "Implement password reset flow", description: "Build backend endpoints and frontend views for resetting passwords." },
  { title: "Research OAuth providers", description: "Compare Google, GitHub, and Apple OAuth integration steps." },
  { title: "Integrate payment gateway Stripe", description: "Support subscription plans and handle webhook events." },
  { title: "Set up project tracking board", description: "Configure boards, columns, and tags for the development sprint." },
  { title: "Audit website accessibility (WCAG)", description: "Ensure the site is compliant with accessibility standards." },
  { title: "Analyze server performance logs", description: "Identify slow response times and optimize server configuration." },
  { title: "Optimize frontend bundle size", description: "Implement code splitting and remove unused packages." },
  { title: "Prepare slide deck for client meeting", description: "Summarize sprint progress and demo the latest features." },
  { title: "Draft release notes for v1.1.0", description: "Document all bug fixes and new features included in this release." },
  { title: "Set up automated backup for database", description: "Configure daily backups to a secure cloud storage bucket." },
  { title: "Conduct user interview feedback session", description: "Gather feedback from beta testers to prioritize backlog." },
  { title: "Resolve styling issues in dark mode", description: "Fix contrast and color themes in several dashboard views." },
  { title: "Add error boundary to frontend app", description: "Gracefully catch rendering errors and show a user-friendly fallback." }
];

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

async function main() {
  console.log('Clearing database...');
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('Hashing password...');
  const passwordHash = await bcrypt.hash('password', 10);

  const usersData = [
    { email: 'user1@gmail.com', name: 'User One' },
    { email: 'user2@gmail.com', name: 'User Two' },
  ];

  for (const userData of usersData) {
    console.log(`Creating user: ${userData.email}...`);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: passwordHash,
      },
    });

    // Random number of tasks between 10 and 20
    const taskCount = Math.floor(Math.random() * 11) + 10;
    console.log(`Generating ${taskCount} tasks for ${userData.email}...`);

    // Shuffle task pool to pick random unique tasks if possible, or just index randomly
    const shuffledPool = [...TASK_POOL].sort(() => 0.5 - Math.random());

    for (let i = 0; i < taskCount; i++) {
      const template = shuffledPool[i % shuffledPool.length];
      const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      
      await prisma.task.create({
        data: {
          title: template.title,
          description: template.description,
          status: randomStatus,
          ownerId: user.id,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
