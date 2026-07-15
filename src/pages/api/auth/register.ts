import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'src/lib/db'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'STAFF', // Default role for now
      }
    })

    return res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error('Registration error:', error)
    
return res.status(500).json({ message: 'Internal server error' })
  }
}
