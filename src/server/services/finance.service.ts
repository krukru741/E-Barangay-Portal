import { UserRole } from '@prisma/client'
import { getBudgets, getExpenditures, addBudget, addExpenditure } from '../repositories/finance.repository'
import { BudgetInput, ExpenditureInput } from 'src/lib/validations/finance.schema'

function canManageFinance(userRole?: UserRole) {
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    throw new Error('FORBIDDEN: Only administrators can manage finances')
  }
}

export async function fetchPublicFinanceData() {
  const budgets = await getBudgets()
  const expenditures = await getExpenditures()

  // Map expenditures to remove sensitive info like Payee and Receipt for public transparency
  const publicExpenditures = expenditures.map(e => ({
    id: e.id,
    date: e.date,
    amount: e.amount,
    category: e.category,
    description: e.description
  }))

  return { budgets, expenditures: publicExpenditures }
}

export async function fetchAdminFinanceData(userRole: UserRole) {
  canManageFinance(userRole)
  const budgets = await getBudgets()
  const expenditures = await getExpenditures()
  return { budgets, expenditures }
}

export async function createBudget(data: BudgetInput, userRole: UserRole) {
  canManageFinance(userRole)
  return await addBudget(data)
}

export async function createExpenditure(data: ExpenditureInput, userRole: UserRole) {
  canManageFinance(userRole)
  return await addExpenditure(data)
}
