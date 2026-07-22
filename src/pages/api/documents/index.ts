import { NextApiRequest, NextApiResponse } from 'next'
import { getDocumentRequests, createDocumentRequest } from 'src/server/services/document.service'
import { documentRequestSchema } from 'src/lib/validations/document.schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const page = parseInt((req.query.page as string) || '1', 10)
      const result = await getDocumentRequests(page)
      return res.status(200).json(result)
    } catch (error) {
      console.error('Error fetching document requests:', error)
      return res.status(500).json({ message: 'Error fetching document requests' })
    }
  }

  if (req.method === 'POST') {
    try {
      const validatedData = documentRequestSchema.parse(req.body)
      const document = await createDocumentRequest(validatedData)
      return res.status(201).json(document)
    } catch (error: any) {
      console.error('Error creating document request:', error)
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors })
      }
      return res.status(500).json({ message: 'Error creating document request' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
