import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'src/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes((session.user as any)?.role)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // Fetch all data for backup
    const [residents, households, users, documents, blotters, hearings, officials, announcements, budgets, expenditures] = await Promise.all([
      prisma.resident.findMany({ include: { household: true } }),
      prisma.household.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }),
      prisma.documentRequest.findMany(),
      prisma.blotter.findMany({ include: { hearings: true } }),
      prisma.hearing.findMany(),
      prisma.official.findMany(),
      prisma.announcement.findMany(),
      prisma.budget.findMany(),
      prisma.expenditure.findMany(),
    ])

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        residents,
        households,
        users,
        documents,
        blotters,
        hearings,
        officials,
        announcements,
        budgets,
        expenditures,
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="ebarangay-backup-${new Date().toISOString().split('T')[0]}.json"`)
    return res.status(200).json(backup)
  } catch (error: any) {
    console.error('Backup API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
