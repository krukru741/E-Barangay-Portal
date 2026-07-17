import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { fetchOfficials, registerOfficial, updateOfficial } from 'src/server/services/official.service'
import { updateOfficialSchema } from 'src/lib/validations/official.schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const role = (session.user as any)?.role

  if (req.method === 'GET') {
    try {
      const officials = await fetchOfficials()
      return res.status(200).json(officials)
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'POST') {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' })
    }
    try {
      const official = await registerOfficial(req.body, (session.user as any).id)
      return res.status(201).json(official)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors })
      }
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'PUT') {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' })
    }
    try {
      const { id, ...data } = req.body
      const validated = updateOfficialSchema.parse(data)
      const official = await updateOfficial(id, validated, (session.user as any).id)
      return res.status(200).json(official)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors })
      }
      return res.status(500).json({ error: error.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
