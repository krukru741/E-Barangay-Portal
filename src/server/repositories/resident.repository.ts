import { prisma } from 'src/lib/db'
import { ResidentInput } from 'src/lib/validations/resident.schema'

export async function findAllResidents() {
  return await prisma.resident.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function findResidentByExactMatch(firstName: string, lastName: string, birthDate: Date) {
  // Try to find a resident with the exact same first name, last name, and birth date
  return await prisma.resident.findFirst({
    where: {
      firstName: {
        equals: firstName,
        mode: 'insensitive',
      },
      lastName: {
        equals: lastName,
        mode: 'insensitive',
      },
      birthDate: {
        equals: birthDate,
      },
    }
  })
}

export async function createResidentRecord(data: ResidentInput, householdId: string) {
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
      isIndigent: data.isIndigent,
      isSenior: data.isSenior,
      isPWD: data.isPWD,
      isVoter: data.isVoter,
      householdId: householdId
    }
  })
}

export async function findOrCreateDefaultHousehold() {
  let household = await prisma.household.findFirst()
  if (!household) {
    household = await prisma.household.create({
      data: {
        street: 'Default Street',
        barangay: 'Default Barangay'
      }
    })
  }
  return household
}
