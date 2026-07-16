import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { fetchPublicFinanceData, createExpenditure, fetchAdminFinanceData } from 'src/server/services/finance.service'
import { expenditureSchema } from 'src/lib/validations/finance.schema'
import { UserRole } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (req.method === 'GET') {
      const userRole = (session?.user as any)?.role as UserRole
      
      if (session && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) {
        const adminData = await fetchAdminFinanceData(userRole)
        return res.status(200).json(adminData.expenditures)
      } else {
        const publicData = await fetchPublicFinanceData()
        return res.status(200).json(publicData.expenditures)
      }
    }

    if (req.method === 'POST') {
      if (!session) return res.status(401).json({ error: 'Unauthorized' })
      const userRole = (session.user as any).role as UserRole
      
      const validatedData = expenditureSchema.parse(req.body)
      const newExpenditure = await createExpenditure(validatedData, userRole)
      return res.status(201).json(newExpenditure)
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
