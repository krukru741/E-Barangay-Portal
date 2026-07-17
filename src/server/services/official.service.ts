import * as officialRepo from '../repositories/official.repository'
import { createOfficialSchema } from 'src/lib/validations/official.schema'
import { logAudit } from './audit.service'

export const fetchOfficials = async () => {
  return await officialRepo.getOfficials()
}

export const registerOfficial = async (data: any, userId: string) => {
  // Validate input
  const validated = createOfficialSchema.parse(data)
  
  // Create official
  const official = await officialRepo.createOfficial(validated)
  
  // Log action
  await logAudit({
    userId,
    action: 'CREATE',
    entity: 'OFFICIAL',
    entityId: official.id,
    details: {
      position: official.position,
      residentId: official.residentId
    }
  })
  
  return official
}

export const updateOfficial = async (id: string, data: any, userId: string) => {
  const official = await officialRepo.updateOfficial(id, data)
  
  await logAudit({
    userId,
    action: 'UPDATE',
    entity: 'OFFICIAL',
    entityId: official.id,
    details: data
  })
  
  return official
}
