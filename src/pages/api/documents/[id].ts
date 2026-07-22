import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'src/pages/api/auth/[...nextauth]'
import { getDocumentRequest, updateRequestStatus } from 'src/server/services/document.service'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const document = await getDocumentRequest(id)
      if (!document) return res.status(404).json({ message: 'Document request not found' })
      return res.status(200).json(document)
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching document request' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const session = await getServerSession(req, res, authOptions)
      const userId = (session?.user as any)?.id

      const { status } = req.body
      const updated = await updateRequestStatus(id, status, userId)
      return res.status(200).json(updated)
    } catch (error) {
      return res.status(500).json({ message: 'Error updating document request' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
