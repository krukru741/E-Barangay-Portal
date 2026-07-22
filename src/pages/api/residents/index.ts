import { NextApiRequest, NextApiResponse } from 'next'
import { getResidents, createResident } from 'src/server/services/resident.service'
import { residentSchema } from 'src/lib/validations/resident.schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const page = parseInt((req.query.page as string) || '1', 10)
      const search = (req.query.search as string) || undefined
      const sortBy = (req.query.sortBy as string) || undefined

      const result = await getResidents(page, search, sortBy)
      
      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching residents:', error)
      
      return res.status(500).json({ message: 'Error fetching residents' })
    }
  }

  if (req.method === 'POST') {
    try {
      // Validate input using Zod
      const validatedData = residentSchema.parse(req.body)

      const resident = await createResident(validatedData)
      
      return res.status(201).json(resident)
    } catch (error: any) {
      console.error('Error creating resident:', error)
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors })
      }
      
      if (error.message && error.message.includes('Duplicate resident')) {
        return res.status(409).json({ message: error.message })
      }
      
      return res.status(500).json({ message: 'Error creating resident' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
