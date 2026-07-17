import { z } from 'zod'
import { Position } from '@prisma/client'

export const createOfficialSchema = z.object({
  residentId: z.string().cuid('Resident ID is required'),
  position: z.nativeEnum(Position, {
    required_error: 'Position is required',
  }),
  committee: z.string().optional(),
  termStart: z.coerce.date({
    required_error: 'Term start date is required',
  }),
  termEnd: z.coerce.date({
    required_error: 'Term end date is required',
  }),
  isActive: z.boolean().default(true),
})

export type CreateOfficialInput = z.infer<typeof createOfficialSchema>

export const updateOfficialSchema = z.object({
  position: z.nativeEnum(Position).optional(),
  committee: z.string().optional(),
  termStart: z.coerce.date().optional(),
  termEnd: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateOfficialInput = z.infer<typeof updateOfficialSchema>
