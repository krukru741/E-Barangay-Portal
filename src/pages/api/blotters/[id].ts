import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getBlotter, changeBlotterStatus, addHearing } from '@/server/services/blotter.service'
import { hearingSchema } from 'src/lib/validations/blotter.schema'
import { UserRole, BlotterStatus } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userRole = (session.user as any).role as UserRole
  const id = req.query.id as string

  if (!id) return res.status(400).json({ error: 'Blotter ID is required' })

  try {
    if (req.method === 'GET') {
      const blotter = await getBlotter(id, userRole)
      return res.status(200).json(blotter)
    }

    if (req.method === 'PATCH') {
      const { status } = req.body
      if (!status) return res.status(400).json({ error: 'Status is required' })
      const updatedBlotter = await changeBlotterStatus(id, status as BlotterStatus, userRole)
      return res.status(200).json(updatedBlotter)
    }

    if (req.method === 'POST') {
      // POST is used here to add a new hearing
      const validatedData = hearingSchema.parse(req.body)
      const newHearing = await addHearing(id, validatedData, userRole)
      return res.status(201).json(newHearing)
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('API Error:', error)
    if (error.message && error.message.includes('FORBIDDEN')) {
      return res.status(403).json({ error: error.message })
    }
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
