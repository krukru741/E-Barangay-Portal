const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.systemSettings.findFirst()
  console.log('Current Settings in DB:', settings)
}
main().finally(() => prisma.$disconnect())
