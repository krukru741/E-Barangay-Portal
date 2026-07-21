import { prisma } from 'src/lib/db'
import { ResidentInput } from 'src/lib/validations/resident.schema'

export async function findAllResidents() {
  return await prisma.resident.findMany({
    where: {
      isMerged: false,
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' },
    include: {
      household: {
        select: {
          sitio: true
        }
      }
    }
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
      isMerged: false,
      deletedAt: null
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
      isHeadOfFamily: data.isHeadOfFamily || false,
      isSoloParent: data.isSoloParent || false,
      is4PsBeneficiary: data.is4PsBeneficiary || false,
      occupation: data.occupation || null,
      educationalAttainment: data.educationalAttainment || null,
      incomeBracket: data.incomeBracket || null,
      photo: data.photo || null,
      householdId: householdId
    }
  })
}

export async function updateResidentRecord(id: string, data: ResidentInput, householdId: string) {
  return await prisma.resident.update({
    where: { id },
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
      isHeadOfFamily: data.isHeadOfFamily,
      isSoloParent: data.isSoloParent || false,
      is4PsBeneficiary: data.is4PsBeneficiary || false,
      occupation: data.occupation || null,
      educationalAttainment: data.educationalAttainment || null,
      incomeBracket: data.incomeBracket || null,
      photo: data.photo || null,
      householdId: householdId
    }
  })
}

export async function createHousehold(data: { houseNumber?: string, street: string, village?: string, sitio?: string, purok?: string, barangay: string, city?: string, province?: string, postalCode?: string, country?: string }) {
  return await prisma.household.create({
    data: {
      houseNumber: data.houseNumber || null,
      street: data.street,
      village: data.village || null,
      sitio: data.sitio || null,
      purok: data.purok || null,
      barangay: data.barangay,
      city: data.city || "Talisay City",
      province: data.province || "Cebu",
      postalCode: data.postalCode || null,
      country: data.country || "Philippines"
    }
  })
}

export async function findOrCreateHousehold(data: { houseNumber?: string, street: string, village?: string, sitio?: string, purok?: string, barangay: string, city?: string, province?: string, postalCode?: string, country?: string }) {
  let household = await prisma.household.findFirst({
    where: {
      houseNumber: data.houseNumber || null,
      street: data.street,
      village: data.village || null,
      sitio: data.sitio || null,
      purok: data.purok || null,
      barangay: data.barangay,
      city: data.city || "Talisay City",
      province: data.province || "Cebu",
      postalCode: data.postalCode || null,
      country: data.country || "Philippines"
    }
  })

  if (!household) {
    household = await prisma.household.create({
      data: {
        houseNumber: data.houseNumber || null,
        street: data.street,
        village: data.village || null,
        sitio: data.sitio || null,
        purok: data.purok || null,
        barangay: data.barangay,
        city: data.city || "Talisay City",
        province: data.province || "Cebu",
        postalCode: data.postalCode || null,
        country: data.country || "Philippines"
      }
    })
  }
  return household
}

export async function findResidentById(id: string) {
  return await prisma.resident.findUnique({
    where: { id },
    include: {
      household: {
        include: {
          residents: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true
            }
          }
        }
      },
      documents: true,
      blottersAsCom: true,
      blottersAsRes: true
    }
  })
}
