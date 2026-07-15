import { NextApiRequest, NextApiResponse } from 'next'
import { getResidents, createResident } from '@/server/services/resident.service'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const residents = await getResidents()
      return res.status(200).json(residents)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body
      const newResident = await createResident(data)
      return res.status(201).json(newResident)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
