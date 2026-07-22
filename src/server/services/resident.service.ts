import { findAllResidents, countResidents, findResidentByExactMatch, createResidentRecord, createHousehold, findResidentById, updateResidentRecord } from '../repositories/resident.repository'
import { ResidentInput } from 'src/lib/validations/resident.schema'
import { prisma } from 'src/lib/db'

export async function getResidents(page = 1, search?: string, sortBy?: string) {
  const [data, total] = await Promise.all([
    findAllResidents(page, search, sortBy),
    countResidents(search),
  ])
  return { data, total, page, pageSize: 50 }
}

export async function getResidentProfile(id: string) {
  return await findResidentById(id)
}

export async function createResident(data: ResidentInput) {
  // Check for duplicates
  const existing = await findResidentByExactMatch(data.firstName, data.lastName, new Date(data.birthDate))
  if (existing) {
    throw new Error('Duplicate resident: A resident with the same name and birth date already exists.')
  }

  // Handle household setup
  let householdId = data.householdId

  if (!householdId) {
    const newHousehold = await createHousehold({
      houseNumber: data.houseNumber,
      street: data.street,
      village: data.village,
      sitio: data.sitio,
      purok: data.purok,
      barangay: data.barangay || 'Poblacion',
      city: data.city || 'Talisay City',
      province: data.province || 'Cebu',
      postalCode: data.postalCode,
      country: data.country || 'Philippines',
    })
    householdId = newHousehold.id
  }

  return await createResidentRecord(data, householdId)
}

export async function updateResident(id: string, data: ResidentInput) {
  // Check if updating to an already existing duplicate resident name (other than self)
  const existing = await findResidentByExactMatch(data.firstName, data.lastName, new Date(data.birthDate))
  if (existing && existing.id !== id) {
    throw new Error('Duplicate resident: Another resident with the same name and birth date already exists.')
  }

  // Handle household setup
  let householdId = data.householdId

  if (!householdId) {
    // No existing household — create a brand new one with all address fields
    const newHousehold = await createHousehold({
      houseNumber: data.houseNumber,
      street: data.street,
      village: data.village,
      sitio: data.sitio,
      purok: data.purok,
      barangay: data.barangay || 'Poblacion',
      city: data.city || 'Talisay City',
      province: data.province || 'Cebu',
      postalCode: data.postalCode,
      country: data.country || 'Philippines',
    })
    householdId = newHousehold.id
  } else {
    // Existing household — update the address fields so changes reflect on the cert
    await prisma.household.update({
      where: { id: householdId },
      data: {
        houseNumber: data.houseNumber || null,
        street: data.street,
        village: data.village || null,
        sitio: data.sitio || null,
        purok: data.purok || null,
        barangay: data.barangay || 'Poblacion',
        city: data.city || 'Talisay City',
        province: data.province || 'Cebu',
        postalCode: data.postalCode || null,
        country: data.country || 'Philippines',
      }
    })
  }

  return await updateResidentRecord(id, data, householdId)
}
