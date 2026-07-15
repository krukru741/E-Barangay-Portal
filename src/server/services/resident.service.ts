import { prisma } from '@/lib/db'

export async function getResidents() {
  return await prisma.resident.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createResident(data: any) {
  // To avoid errors with household setup right now, we will create a default household
  // if none is provided, or link to an existing one. For simplicity in this early phase,
  // we'll just create a dummy household for the resident.
  
  let household = await prisma.household.findFirst()
  if (!household) {
    household = await prisma.household.create({
      data: {
        street: 'Default Street',
        barangay: 'Default Barangay'
      }
    })
  }

  return await prisma.resident.create({
    data: {
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      suffix: data.suffix || null,
      birthDate: new Date(data.birthDate),
      gender: data.gender,
      civilStatus: data.civilStatus,
      contactNumber: data.contactNumber || null,
      email: data.email || null,
      householdId: household.id
    }
  })
}
