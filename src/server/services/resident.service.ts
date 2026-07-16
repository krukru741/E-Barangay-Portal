import { findAllResidents, findResidentByExactMatch, createResidentRecord, findOrCreateDefaultHousehold } from '../repositories/resident.repository'
import { ResidentInput } from 'src/lib/validations/resident.schema'

export async function getResidents() {
  return await findAllResidents()
}

export async function createResident(data: ResidentInput) {
  // Check for duplicates
  const existing = await findResidentByExactMatch(data.firstName, data.lastName, new Date(data.birthDate))
  if (existing) {
    throw new Error('Duplicate resident: A resident with the same name and birth date already exists.')
  }

  // Handle household setup
  const household = await findOrCreateDefaultHousehold()

  return await createResidentRecord(data, household.id)
}
