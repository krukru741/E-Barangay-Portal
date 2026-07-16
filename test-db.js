const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: "postgresql://postgres.urhzfsulwkxvspuivqfn:E-barangay2026@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=60"
    }
  }
})

async function main() {
  console.log('Testing connection to DB using Transaction Pooler...')
  try {
    const budgets = await prisma.budget.findMany()
    console.log('SUCCESS! Budgets found:', budgets.length)
  } catch (err) {
    console.error('ERROR connecting:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
