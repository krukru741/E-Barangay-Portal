const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing connection...')
    const settings = await prisma.systemSettings.findFirst()
    console.log('Connection successful. Settings found:', settings ? settings.id : 'None')
  } catch (err) {
    console.error('Error connecting to DB:', err)
  }
}
main().finally(() => prisma.$disconnect())
