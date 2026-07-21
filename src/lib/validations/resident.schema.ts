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
  isSoloParent: z.boolean().optional().default(false),
  is4PsBeneficiary: z.boolean().optional().default(false),
  isHeadOfFamily: z.boolean().optional().default(false),
  householdId: z.string().optional(),
  photo: z.string().optional(),

  // Socio-Economic Fields
  occupation: z.enum(['UNEMPLOYED', 'STUDENT', 'SELF_EMPLOYED', 'PRIVATE_EMPLOYEE', 'GOVERNMENT_EMPLOYEE', 'OTHERS']).optional().nullable(),
  educationalAttainment: z.enum(['ELEMENTARY', 'HIGH_SCHOOL', 'VOCATIONAL', 'COLLEGE_GRADUATE', 'POST_GRADUATE', 'NONE']).optional().nullable(),
  incomeBracket: z.enum(['BELOW_10K', 'FROM_10K_TO_20K', 'FROM_20K_TO_40K', 'ABOVE_40K']).optional().nullable(),
  
  // Address / Household fields
  houseNumber: z.string().optional(),
  street: z.string().optional().default(''), // Allow empty string to satisfy DB schema
  village: z.string().optional(),
  sitio: z.string().optional(),
  purok: z.string().optional(),
  barangay: z.string().default('Poblacion'),
  city: z.string().default('Talisay City'),
  province: z.string().default('Cebu'),
  postalCode: z.string().optional(),
  country: z.string().default('Philippines'),
}).superRefine((data, ctx) => {
  // Ensure at least one of Street, Sitio, or Purok is provided
  const hasStreet = data.street && data.street.trim().length > 0;
  const hasSitio = data.sitio && data.sitio.trim().length > 0;
  const hasPurok = data.purok && data.purok.trim().length > 0;
  
  if (!hasStreet && !hasSitio && !hasPurok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide at least a Street Name, Sitio, OR Purok",
      path: ["street"], // Attach error to street field
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Required",
      path: ["sitio"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Required",
      path: ["purok"],
    });
  }
})

export type ResidentInput = z.infer<typeof residentSchema>
