import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getBlotters, createBlotter } from '@/server/services/blotter.service'
import { blotterSchema } from 'src/lib/validations/blotter.schema'
import { UserRole } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userRole = (session.user as any).role as UserRole

  try {
    if (req.method === 'GET') {
      const blotters = await getBlotters(userRole)
      return res.status(200).json(blotters)
    }

    if (req.method === 'POST') {
      const validatedData = blotterSchema.parse(req.body)
      const newBlotter = await createBlotter(validatedData, userRole)
      return res.status(201).json(newBlotter)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.message && error.message.includes('FORBIDDEN')) {
      return res.status(403).json({ error: error.message })
    }
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
