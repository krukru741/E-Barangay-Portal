import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'src/pages/api/auth/[...nextauth]'
import { getResidentProfile, updateResident } from 'src/server/services/resident.service'
import { residentSchema } from 'src/lib/validations/resident.schema'
import { ZodError } from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const resident = await getResidentProfile(id as string)
      if (!resident) {
        return res.status(404).json({ message: 'Resident not found' })
      }
      return res.status(200).json(resident)
    } catch (error) {
      console.error('Error fetching resident profile:', error)
      return res.status(500).json({ message: 'Error fetching resident' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions)
      const userId = (session?.user as any)?.id

      const validatedData = residentSchema.parse(req.body)
      const updatedResident = await updateResident(id as string, validatedData, userId)
      return res.status(200).json(updatedResident)
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors })
      }
      console.error('Error updating resident profile:', error)
      return res.status(500).json({ message: error.message || 'Error updating resident' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
