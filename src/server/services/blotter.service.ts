import { findAllBlotters, findBlotterById, createBlotterRecord, updateBlotterStatus, addHearingToBlotter, getNextBlotterNumber } from '../repositories/blotter.repository'
import { BlotterInput, HearingInput } from 'src/lib/validations/blotter.schema'
import { BlotterStatus, UserRole } from '@prisma/client'

// Helper to check authorization
function checkAdminOrStaffRole(userRole?: UserRole) {
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.STAFF && userRole !== UserRole.SUPER_ADMIN) {
    throw new Error('FORBIDDEN: You do not have permission to access Blotter Records')
  }
}

export async function getBlotters(userRole: UserRole) {
  checkAdminOrStaffRole(userRole)
  return await findAllBlotters()
}

export async function getBlotter(id: string, userRole: UserRole) {
  checkAdminOrStaffRole(userRole)
  const blotter = await findBlotterById(id)
  if (!blotter) throw new Error('Blotter record not found')
  return blotter
}

export async function createBlotter(data: BlotterInput, userRole: UserRole) {
  checkAdminOrStaffRole(userRole)
  // Ensure the blotter number is unique
  // For simplicity, we just pass it to repo which has @unique constraint
  // In production, we'd handle the Prisma duplicate error explicitly
  return await createBlotterRecord(data)
}

export async function changeBlotterStatus(id: string, status: BlotterStatus, userRole: UserRole) {
  checkAdminOrStaffRole(userRole)
  return await updateBlotterStatus(id, status)
}

export async function addHearing(blotterId: string, data: HearingInput, userRole: UserRole) {
  checkAdminOrStaffRole(userRole)
  // If a hearing is added, the status might automatically become MEDIATION
  await updateBlotterStatus(blotterId, BlotterStatus.MEDIATION)
  return await addHearingToBlotter(blotterId, data)
}

export async function getNextNumber(userRole: UserRole) {
  checkAdminOrStaffRole(userRole)
  return await getNextBlotterNumber()
}
