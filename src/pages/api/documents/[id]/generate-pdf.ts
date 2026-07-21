import { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, format } = req.query
  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' })

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const document = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        resident: {
          include: {
            household: true
          }
        },
        issuedBy: true
      }
    })

    if (!document) return res.status(404).json({ message: 'Document not found' })

    const template = await prisma.documentTemplate.findUnique({
      where: { type: document.type }
    })

    if (!template) {
      return res.status(404).json({ message: 'Template not found for this document type' })
    }

    const settings = await prisma.systemSettings.findFirst()

    const officials = await prisma.official.findMany({
      where: { isActive: true },
      include: { resident: true }
    })
    const captain = officials.find(o => o.position === 'CAPTAIN')

    let html = template.contentHtml

    // Variables replacement
    const fullName = `${document.resident.firstName} ${document.resident.middleName ? document.resident.middleName + ' ' : ''}${document.resident.lastName}`.trim().toUpperCase()
    
    // Address formatting
    const h = document.resident.household
    let address = 'N/A'
    if (h) {
      const parts = []
      if (h.houseNumber && h.houseNumber !== 'n/a' && h.houseNumber !== 'N/A') parts.push(`House No. ${h.houseNumber}`)
      if (h.street && h.street !== 'n/a' && h.street !== 'N/A') parts.push(h.street)
      if (h.village && h.village !== 'n/a' && h.village !== 'N/A') parts.push(h.village)
      if (h.sitio && h.sitio !== 'n/a' && h.sitio !== 'N/A') parts.push(`Sitio ${h.sitio}`)
      if (h.purok && h.purok !== 'n/a' && h.purok !== 'N/A') parts.push(`Purok ${h.purok}`)
      let brgy = h.barangay || "Poblacion"
      if (brgy.toLowerCase().startsWith("barangay ")) brgy = brgy.substring(9).trim()
      parts.push(`Barangay ${brgy}`)
      parts.push(h.city || 'Talisay City')
      parts.push(h.province || 'Cebu')
      address = parts.join(', ')
    }

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const captainName = captain ? `${captain.resident.firstName} ${captain.resident.lastName}`.toUpperCase() : 'NO CAPTAIN ASSIGNED'
    const age = new Date().getFullYear() - new Date(document.resident.birthDate).getFullYear()

    html = html.replace(/{{fullName}}/g, fullName)
    html = html.replace(/{{residentName}}/g, fullName)
    html = html.replace(/{{address}}/g, address)
    html = html.replace(/{{purpose}}/g, document.purpose || '')
    html = html.replace(/{{date}}/g, currentDate)
    html = html.replace(/{{captainName}}/g, captainName)
    html = html.replace(/{{orNumber}}/g, document.orNumber || '')
    html = html.replace(/{{feeAmount}}/g, document.feeAmount?.toString() || '')
    html = html.replace(/{{age}}/g, age.toString())
    html = html.replace(/{{civilStatus}}/g, document.resident.civilStatus)

    // System settings
    if (settings) {
       html = html.replace(/{{barangayName}}/g, settings.barangayName)
       html = html.replace(/{{cityMunicipality}}/g, settings.cityMunicipality)
       html = html.replace(/{{province}}/g, settings.province)
    }

    // Generate QR Code base64
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host
    const verificationUrl = `${protocol}://${host}/verify/${id}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', margin: 1 })

    html = html.replace(/{{qrCode}}/g, `<img src="${qrCodeDataUrl}" style="width:100px; height:100px;" />`)

    // Add basic HTML structure if not present
    if (!html.includes('<html')) {
        html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .mt-4 { margin-top: 1rem; }
                .mt-8 { margin-top: 2rem; }
                .mb-4 { margin-bottom: 1rem; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .items-center { align-items: center; }
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>
        `
    }

    // Generate PDF
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Format could be explicitly 'Legal', default to 'A4'
    const pageSize = format === 'Legal' ? 'Legal' : 'A4'

    const pdfBuffer = await page.pdf({
      format: pageSize,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="document-${id}.pdf"`)
    res.send(pdfBuffer)

  } catch (error: any) {
    console.error('PDF Gen Error:', error)
    res.status(500).json({ message: 'Error generating PDF', error: error.message })
  }
}
