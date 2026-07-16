import { prisma } from 'src/lib/db'
import { BudgetInput, ExpenditureInput } from 'src/lib/validations/finance.schema'

export async function getBudgets() {
  return await prisma.budget.findMany({
    orderBy: { year: 'desc' }
  })
}

export async function addBudget(data: BudgetInput) {
  return await prisma.budget.create({
    data: {
      year: data.year,
      totalAmount: data.totalAmount,
      source: data.source,
      description: data.description || ''
    }
  })
}

export async function getExpenditures() {
  return await prisma.expenditure.findMany({
    orderBy: { date: 'desc' }
  })
}

export async function addExpenditure(data: ExpenditureInput) {
  return await prisma.expenditure.create({
    data: {
      date: new Date(data.date),
      amount: data.amount,
      category: data.category,
      payee: data.payee,
      description: data.description,
      receiptUrl: data.receiptUrl || ''
    }
  })
}
