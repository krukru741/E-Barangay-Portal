import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'src/pages/api/auth/[...nextauth]'
import { prisma } from 'src/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const currentYear = new Date().getFullYear()

    const [
      pendingDocsCount,
      openBlotterCount,
      totalBudgetAgg,
      totalExpenditureAgg
    ] = await Promise.all([
      // Count pending documents
      prisma.documentRequest.count({
        where: { status: 'PENDING' }
      }),
      
      // Count open blotter cases
      prisma.blotter.count({
        where: { status: 'OPEN' }
      }),

      // Get total budget for current year
      prisma.budget.aggregate({
        where: { year: currentYear },
        _sum: { totalAmount: true }
      }),

      // Get total expenditures for current year
      prisma.expenditure.aggregate({
        where: { 
          date: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`)
          }
        },
        _sum: { amount: true }
      })
    ])

    const notifications = []
    let idCounter = 1

    // Add Documents Notification
    if (pendingDocsCount > 0) {
      notifications.push({
        id: idCounter++,
        title: `${pendingDocsCount} Pending Document${pendingDocsCount > 1 ? 's' : ''}`,
        subtitle: 'Needs review and release',
        icon: 'FILE', 
        color: 'primary',
        time: 'Just now'
      })
    }

    // Add Blotter Notification
    if (openBlotterCount > 0) {
      notifications.push({
        id: idCounter++,
        title: `${openBlotterCount} Open Blotter Case${openBlotterCount > 1 ? 's' : ''}`,
        subtitle: 'Requires mediation or action',
        icon: 'GAVEL', 
        color: 'error',
        time: 'Just now'
      })
    }

    // Add Budget Notification
    const totalBudget = totalBudgetAgg._sum.totalAmount || 0
    const totalSpent = totalExpenditureAgg._sum.amount || 0
    
    if (totalBudget > 0) {
      const spendRatio = totalSpent / totalBudget
      if (spendRatio >= 0.8) {
        notifications.push({
          id: idCounter++,
          title: 'Low Budget Warning! ⚠️',
          subtitle: `Spent ${(spendRatio * 100).toFixed(1)}% of ${currentYear} budget`,
          icon: 'CASH',
          color: 'warning',
          time: 'Important'
        })
      }
    }

    return res.status(200).json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
