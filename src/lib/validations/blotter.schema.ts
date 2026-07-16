import { z } from 'zod'

export const blotterSchema = z.object({
  blotterNumber: z.string().min(1, "Blotter number is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  incidentDate: z.string().or(z.date()),
  location: z.string().min(1, "Location is required"),
  narrative: z.string().min(5, "Narrative must be at least 5 characters"),
  complainantId: z.string().min(1, "Complainant is required"),
  respondentId: z.string().min(1, "Respondent is required"),
})

export type BlotterInput = z.infer<typeof blotterSchema>

export const hearingSchema = z.object({
  scheduledAt: z.string().or(z.date()),
  outcome: z.string().optional(),
  attendees: z.array(z.string()).optional(),
})

export type HearingInput = z.infer<typeof hearingSchema>
