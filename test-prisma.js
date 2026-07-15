require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ url: process.env.DATABASE_URL });

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
