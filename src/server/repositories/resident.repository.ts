import { prisma } from 'src/lib/db'
import { ResidentInput } from 'src/lib/validations/resident.schema'

const PAGE_SIZE = 50

export async function countResidents(search?: string): Promise<number> {
  return prisma.resident.count({
    where: {
      isMerged: false,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
  })
}

export async function findAllResidents(page = 1, search?: string, sortBy?: string) {
  const skip = (page - 1) * PAGE_SIZE

  // Build orderBy based on sort preference
  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'alphabetical') {
    orderBy = [{ firstName: 'asc' }, { lastName: 'asc' }]
  } else if (sortBy === 'sitio') {
    orderBy = { household: { sitio: 'asc' } }
  }

  return await prisma.resident.findMany({
    take: PAGE_SIZE,
    skip,
    where: {
      isMerged: false,
      deletedAt: null,
      // Search is done at the DB level — no more client-side filtering
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy,
    // Explicit select avoids loading the `photo` base64 blob in list views.
    // The full photo is loaded separately in the /residents/[id] profile page.
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      suffix: true,
      gender: true,
      civilStatus: true,
      isSenior: true,
      isPWD: true,
      isIndigent: true,
      isVoter: true,
      isSoloParent: true,
      isHeadOfFamily: true,
      createdAt: true,
      household: {
        select: { sitio: true }
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
