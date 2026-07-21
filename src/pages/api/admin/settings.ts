import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'src/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Public read - allows print view to load barangay settings without login check
      let settings = await prisma.systemSettings.findFirst()
      if (!settings) {
        settings = await prisma.systemSettings.create({ data: {} })
      }
      return res.status(200).json(settings)
    }

    // Protect PUT route (only admin can change settings)
    const session = await getServerSession(req, res, authOptions)
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes((session.user as any)?.role)) {
      console.log('Unauthorized attempt:', session)
      return res.status(401).json({ error: 'Unauthorized', session })
    }

    if (req.method === 'PUT') {
      const { barangayName, cityMunicipality, province, contactNumber, email, logoUrl } = req.body
      let settings = await prisma.systemSettings.findFirst()
      
      if (settings) {
        settings = await prisma.systemSettings.update({
          where: { id: settings.id },
          data: { barangayName, cityMunicipality, province, contactNumber, email, logoUrl }
        })
      } else {
        settings = await prisma.systemSettings.create({
          data: { barangayName, cityMunicipality, province, contactNumber, email, logoUrl }
        })
      }
      
      return res.status(200).json(settings)
    }

    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
