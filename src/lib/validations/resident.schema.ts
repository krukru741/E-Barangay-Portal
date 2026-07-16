import { z } from 'zod'

export const residentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name is required"),
  suffix: z.string().optional(),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'COHABITING']),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  isIndigent: z.boolean().optional().default(false),
  isSenior: z.boolean().optional().default(false),
  isPWD: z.boolean().optional().default(false),
  isVoter: z.boolean().optional().default(false),
})

export type ResidentInput = z.infer<typeof residentSchema>
