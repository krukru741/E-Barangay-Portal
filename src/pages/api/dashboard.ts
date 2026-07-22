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
      recentDocuments,
      recentBlotters,
      latestAnnouncements,
    ] = await Promise.all([
      // Summary counts
      prisma.resident.count({ where: { isMerged: false, deletedAt: null } }),
      prisma.blotter.count(),
      prisma.announcement.count(),

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
      recentDocuments,
      recentBlotters,
      latestAnnouncements,
    })
  } catch (error: any) {
    console.error('[/api/dashboard] Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
