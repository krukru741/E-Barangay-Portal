import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from 'src/lib/db'

/**
 * /api/dashboard — Aggregated endpoint for the dashboard page.
 *
 * Replaces 4 separate fetch() calls with a single request.
 * All queries run in parallel via Promise.all.
 * Only fetches the exact fields needed by the dashboard widgets.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    // Run ALL dashboard queries in parallel — a single DB round-trip pattern.
    const [
      totalResidents,
      totalBlotters,
      totalAnnouncements,
      revenueAgg,
      budgetAgg,
      expenditureAgg,
      genderGroup,
      seniorCount,
      pwdCount,
      soloParentCount,
      fourPsCount,
      householdCount,
      voterCount,
      recentDocuments,
      recentBlotters,
      latestAnnouncements,
    ] = await Promise.all([
      // Summary counts
      prisma.resident.count({ where: { isMerged: false, deletedAt: null } }),
      prisma.blotter.count(),
      prisma.announcement.count(),

      // Financials
      prisma.documentRequest.aggregate({ _sum: { feeAmount: true }, where: { status: 'RELEASED' } }),
      prisma.budget.aggregate({ _sum: { totalAmount: true } }),
      prisma.expenditure.aggregate({ _sum: { amount: true } }),

      // Demographics
      prisma.resident.groupBy({ by: ['gender'], _count: true, where: { isMerged: false, deletedAt: null } }),
      prisma.resident.count({ where: { isSenior: true, isMerged: false, deletedAt: null } }),
      prisma.resident.count({ where: { isPWD: true, isMerged: false, deletedAt: null } }),
      prisma.resident.count({ where: { isSoloParent: true, isMerged: false, deletedAt: null } }),
      prisma.resident.count({ where: { is4PsBeneficiary: true, isMerged: false, deletedAt: null } }),
      prisma.household.count(),
      prisma.resident.count({ where: { isVoter: true, isMerged: false, deletedAt: null } }),

      // Recent 5 documents — select only what the table needs, NO photo blob
      prisma.documentRequest.findMany({
        take: 5,
        orderBy: { requestedAt: 'desc' },
        select: {
          id: true,
          queueNumber: true,
          type: true,
          status: true,
          requestedAt: true,
          resident: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),

      // Recent 5 blotters
      prisma.blotter.findMany({
        take: 5,
        orderBy: { filedAt: 'desc' },
        select: {
          id: true,
          blotterNumber: true,
          incidentType: true,
          status: true,
          filedAt: true,
        },
      }),

      // Latest 3 announcements (pinned first)
      prisma.announcement.findMany({
        take: 3,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        select: {
          id: true,
          title: true,
          type: true,
          isPinned: true,
          publishedAt: true,
        },
      }),
    ])

    return res.status(200).json({
      summary: { totalResidents, totalBlotters, totalAnnouncements },
      financials: {
        totalRevenue: revenueAgg._sum.feeAmount || 0,
        totalBudget: budgetAgg._sum.totalAmount || 0,
        totalExpenditure: expenditureAgg._sum.amount || 0,
      },
      demographics: {
        gender: genderGroup.reduce((acc: any, curr) => ({ ...acc, [curr.gender]: curr._count }), {}),
        vulnerableSectors: {
          senior: seniorCount,
          pwd: pwdCount,
          soloParent: soloParentCount,
          fourPs: fourPsCount,
        },
        households: householdCount,
        voters: voterCount,
      },
      recentDocuments,
      recentBlotters,
      latestAnnouncements,
    })
  } catch (error: any) {
    console.error('[/api/dashboard] Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
