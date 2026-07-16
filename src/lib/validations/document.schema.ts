import { z } from 'zod'

export const documentRequestSchema = z.object({
  type: z.enum(['CLEARANCE', 'RESIDENCY', 'INDIGENCY', 'BUSINESS', 'GOOD_MORAL', 'ENDORSEMENT']),
  purpose: z.string().min(2, "Purpose is required"),
  residentId: z.string().min(1, "Resident is required"),
  remarks: z.string().optional(),
})

export type DocumentRequestInput = z.infer<typeof documentRequestSchema>
