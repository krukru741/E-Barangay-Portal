import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'src/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const userId = (session.user as any).id

    if (req.method === 'GET') {
      // Find the resident record linked to the current logged-in user
      const resident = await prisma.resident.findFirst({
        where: { userId },
        include: {
          household: true
        }
      })
      
      if (!resident) return res.status(404).json({ error: 'No resident profile linked to this account' })
      return res.status(200).json(resident)
    }

    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('User Resident API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
