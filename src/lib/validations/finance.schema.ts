import { z } from 'zod'

export const budgetSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  totalAmount: z.number().positive(),
  source: z.string().min(2),
  description: z.string().optional()
})

export type BudgetInput = z.infer<typeof budgetSchema>

export const expenditureSchema = z.object({
  date: z.string(),
  amount: z.number().positive(),
  category: z.string().min(2),
  payee: z.string().min(2),
  description: z.string().min(5),
  receiptUrl: z.string().optional()
})

export type ExpenditureInput = z.infer<typeof expenditureSchema>
