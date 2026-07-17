import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch all households, and for each household, get its residents to find the Head of Family
      const households = await prisma.household.findMany({
        include: {
          residents: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              isHeadOfFamily: true
            }
          },
          _count: {
            select: { residents: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json(households)
    } catch (error) {
      console.error('Error fetching households:', error)
      return res.status(500).json({ message: 'Error fetching households' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
