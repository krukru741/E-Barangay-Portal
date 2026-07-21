const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const dummyBase64 = 'data:image/png;base64,' + 'A'.repeat(2 * 1024 * 1024) // 2MB string
    const updated = await prisma.systemSettings.update({
      where: { id: 'cmru3bp3f0000fh5888wm5tur' },
      data: {
        logoUrl: dummyBase64,
        cityLogoUrl: '',
        watermarkUrl: ''
      }
    })
    console.log('Update succeeded')
  } catch (err) {
    console.error('Prisma Error:', err.message)
  }
}
main().finally(() => prisma.$disconnect())
