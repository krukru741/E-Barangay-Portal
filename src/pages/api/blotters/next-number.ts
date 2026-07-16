import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getNextNumber } from 'src/server/services/blotter.service'
import { UserRole } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userRole = (session.user as any).role as UserRole

  try {
    if (req.method === 'GET') {
      const nextNumber = await getNextNumber(userRole)
      return res.status(200).json({ nextNumber })
    }

    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.message && error.message.includes('FORBIDDEN')) {
      return res.status(403).json({ error: error.message })
    }
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
