import { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, format } = req.query
  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' })

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host || 'localhost:3000'
    const url = `${protocol}://${host}/documents/print/${id}`

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    
    // Debug logging
    page.on('console', msg => console.log('PUPPETEER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('PUPPETEER ERROR:', error.message));
    page.on('requestfailed', request => console.error('PUPPETEER REQUEST FAILED:', request.url(), request.failure()?.errorText));

    // Set viewport to a good print size
    await page.setViewport({ width: 1200, height: 1600 })
    
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    
    // Wait for the React component to finish loading and fetching data
    await page.waitForSelector('#print-ready', { timeout: 15000 })

    const pageSize = format === 'Legal' ? 'Legal' : 'A4'

    const pdfBuffer = await page.pdf({
      format: pageSize,
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="document-${id}.pdf"`)
    res.send(Buffer.from(pdfBuffer))

  } catch (error: any) {
    console.error('PDF Gen Error:', error)
    res.status(500).json({ message: 'Error generating PDF', error: error.message })
  }
}
