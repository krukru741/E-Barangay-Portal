const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT 1 as result`
    console.log("Connection successful:", res)
  } catch (err) {
    console.error("Connection failed:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
