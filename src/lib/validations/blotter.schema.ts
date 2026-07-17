import { z } from 'zod'

export const blotterSchema = z.object({
  blotterNumber: z.string().min(1, "Blotter number is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  incidentDate: z.string().or(z.date()),
  location: z.string().min(1, "Location is required"),
  narrative: z.string().min(5, "Narrative must be at least 5 characters"),
  complainantId: z.string().optional(),
  complainantName: z.string().optional(),
  respondentId: z.string().optional(),
  respondentName: z.string().optional(),
  witnesses: z.string().optional(),
}).refine((data) => data.complainantId || data.complainantName, {
  message: "Either Complainant (Resident) or Complainant Name is required",
  path: ["complainantId"],
}).refine((data) => data.respondentId || data.respondentName, {
  message: "Either Respondent (Resident) or Respondent Name is required",
  path: ["respondentId"],
})

export type BlotterInput = z.infer<typeof blotterSchema>

export const hearingSchema = z.object({
  scheduledAt: z.string().or(z.date()),
  outcome: z.string().optional(),
  attendees: z.array(z.string()).optional(),
})

export type HearingInput = z.infer<typeof hearingSchema>
