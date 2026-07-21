import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from 'src/lib/db'

const DEFAULT_TEMPLATES: Record<string, string> = {
  CLEARANCE: `<div style="font-family: Arial, sans-serif; padding: 40px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2>BARANGAY CLEARANCE</h2>
    <p>Republic of the Philippines</p>
    <p><strong>{{barangayName}}</strong></p>
    <p>{{cityMunicipality}}, {{province}}</p>
  </div>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>This is to certify that <strong>{{residentName}}</strong>, {{age}} years old, {{civilStatus}}, a resident of <strong>{{address}}</strong>, has been known to be a person of good moral character and has not been involved in any criminal activities in this barangay.</p>
  <p>This certification is issued upon the request of the above-named person for <strong>{{purpose}}</strong>.</p>
  <p>Issued this {{date}} at {{barangayName}}, {{cityMunicipality}}, {{province}}.</p>
  <br/><br/>
  <p style="text-align: center;"><strong>HON. {{captainName}}</strong><br/>Barangay Captain</p>
</div>`,
  RESIDENCY: `<div style="font-family: Arial, sans-serif; padding: 40px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2>CERTIFICATE OF RESIDENCY</h2>
    <p>Republic of the Philippines</p>
    <p><strong>{{barangayName}}</strong></p>
    <p>{{cityMunicipality}}, {{province}}</p>
  </div>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>This is to certify that <strong>{{residentName}}</strong>, {{age}} years old, {{civilStatus}}, is a bonafide resident of <strong>{{address}}</strong>, {{barangayName}}, {{cityMunicipality}}, for <strong>{{yearsOfResidency}}</strong> years.</p>
  <p>This certification is issued upon the request of the above-named person for <strong>{{purpose}}</strong>.</p>
  <p>Issued this {{date}} at {{barangayName}}, {{cityMunicipality}}, {{province}}.</p>
  <br/><br/>
  <p style="text-align: center;"><strong>HON. {{captainName}}</strong><br/>Barangay Captain</p>
</div>`,
  INDIGENCY: `<div style="font-family: Arial, sans-serif; padding: 40px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2>CERTIFICATE OF INDIGENCY</h2>
    <p>Republic of the Philippines</p>
    <p><strong>{{barangayName}}</strong></p>
    <p>{{cityMunicipality}}, {{province}}</p>
  </div>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>This is to certify that <strong>{{residentName}}</strong>, {{age}} years old, a resident of <strong>{{address}}</strong>, belongs to an indigent family with limited financial capability.</p>
  <p>This certification is issued upon the request of the above-named person for <strong>{{purpose}}</strong>.</p>
  <p>Issued this {{date}} at {{barangayName}}, {{cityMunicipality}}, {{province}}.</p>
  <br/><br/>
  <p style="text-align: center;"><strong>HON. {{captainName}}</strong><br/>Barangay Captain</p>
</div>`,
  GOOD_MORAL: `<div style="font-family: Arial, sans-serif; padding: 40px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2>CERTIFICATE OF GOOD MORAL CHARACTER</h2>
    <p>Republic of the Philippines</p>
    <p><strong>{{barangayName}}</strong></p>
    <p>{{cityMunicipality}}, {{province}}</p>
  </div>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>This is to certify that <strong>{{residentName}}</strong>, {{age}} years old, is a resident of <strong>{{address}}</strong> and is known to be a person of good moral character, upright and law-abiding citizen.</p>
  <p>This certification is issued upon the request of the above-named person for <strong>{{purpose}}</strong>.</p>
  <p>Issued this {{date}} at {{barangayName}}, {{cityMunicipality}}, {{province}}.</p>
  <br/><br/>
  <p style="text-align: center;"><strong>HON. {{captainName}}</strong><br/>Barangay Captain</p>
</div>`,
  BUSINESS: `<div style="font-family: Arial, sans-serif; padding: 40px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2>BARANGAY BUSINESS CLEARANCE</h2>
    <p>Republic of the Philippines</p>
    <p><strong>{{barangayName}}</strong></p>
    <p>{{cityMunicipality}}, {{province}}</p>
  </div>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>This is to certify that <strong>{{residentName}}</strong>, owner of <strong>{{businessName}}</strong> located at <strong>{{businessAddress}}</strong>, has been granted clearance to operate said business in this barangay.</p>
  <p>This clearance is issued upon the request of the above-named person for <strong>{{purpose}}</strong>.</p>
  <p>Issued this {{date}} at {{barangayName}}, {{cityMunicipality}}, {{province}}.</p>
  <br/><br/>
  <p style="text-align: center;"><strong>HON. {{captainName}}</strong><br/>Barangay Captain</p>
</div>`,
  ENDORSEMENT: `<div style="font-family: Arial, sans-serif; padding: 40px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2>ENDORSEMENT LETTER</h2>
    <p>Republic of the Philippines</p>
    <p><strong>{{barangayName}}</strong></p>
    <p>{{cityMunicipality}}, {{province}}</p>
  </div>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>This is to endorse and recommend <strong>{{residentName}}</strong>, {{age}} years old, a resident of <strong>{{address}}</strong>, for your favorable consideration and assistance.</p>
  <p>This endorsement is issued in behalf of the above-named person for <strong>{{purpose}}</strong>.</p>
  <p>Issued this {{date}} at {{barangayName}}, {{cityMunicipality}}, {{province}}.</p>
  <br/><br/>
  <p style="text-align: center;"><strong>HON. {{captainName}}</strong><br/>Barangay Captain</p>
</div>`,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes((session.user as any)?.role)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      const templates = await prisma.documentTemplate.findMany()
      // Return defaults merged with saved
      const result = Object.keys(DEFAULT_TEMPLATES).map(type => {
        const saved = templates.find(t => t.type === type)
        return {
          type,
          contentHtml: saved ? saved.contentHtml : DEFAULT_TEMPLATES[type],
          isSaved: !!saved,
          id: saved?.id || null
        }
      })
      return res.status(200).json(result)
    }

    if (req.method === 'PUT') {
      const { type, contentHtml } = req.body
      if (!type || !contentHtml) {
        return res.status(400).json({ error: 'type and contentHtml are required' })
      }
      
      const existing = await prisma.documentTemplate.findFirst({ where: { type } })
      let template
      if (existing) {
        template = await prisma.documentTemplate.update({ where: { id: existing.id }, data: { contentHtml } })
      } else {
        template = await prisma.documentTemplate.create({ data: { type, contentHtml } })
      }
      return res.status(200).json(template)
    }

    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
