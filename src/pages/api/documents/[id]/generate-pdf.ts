/**
 * /api/documents/[id]/generate-pdf
 *
 * Generates a PDF for a specific DocumentRequest.
 *
 * PERFORMANCE IMPROVEMENTS vs. the old implementation:
 *
 * OLD (30–60s):
 *   1. puppeteer.launch() → 3–8s to spin up a new 150MB Chrome process
 *   2. page.goto('/documents/print/{id}') → Next.js page navigation
 *   3. React hydrates the print page
 *   4. Print page makes 4 more fetch() API calls (document, officials, settings, templates)
 *   5. page.waitForSelector('#print-ready', { timeout: 60000 }) → up to 60s wait
 *   6. browser.close() → no reuse, next request starts from scratch
 *
 * NEW (2–5s):
 *   1. getBrowser() → returns warm shared instance (0ms after first request)
 *   2. buildDocumentHtml() → queries Prisma directly (0 HTTP round-trips, ~200ms)
 *   3. page.setContent(html) → renders pre-built HTML (~200ms)
 *   4. page.pdf() → generate PDF (~500ms)
 *   5. page.close() → browser stays warm for next request
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { withPage } from 'src/lib/browser-pool'
import { buildDocumentHtml } from 'src/server/services/pdf-template.service'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id, format } = req.query
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid document ID' })
  }

  // Auth check — only authenticated users can download PDFs
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const pageFormat = format === 'Legal' ? 'Legal' : 'A4'

    // Step 1: Build the document HTML on the server (direct Prisma — no HTTP)
    const { html } = await buildDocumentHtml(id, baseUrl, pageFormat)

    // Step 2: Render HTML and generate PDF using the shared browser pool
    const pdfBuffer = await withPage(async (page) => {
      // Set the pre-built HTML directly — no navigation, no React, no API calls
      await page.setContent(html, {
        // 'networkidle0' waits until there are no more pending network requests.
        // Since our HTML is self-contained (base64 images, inline CSS),
        // this resolves in ~200ms.
        waitUntil: 'networkidle0',
      })

      return page.pdf({
        format: pageFormat,
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      })
    })

    // Step 3: Stream the PDF back to the client
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="document-${id}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(Buffer.from(pdfBuffer))

  } catch (error: any) {
    console.error('[generate-pdf] Error:', error)

    if (error.message?.includes('not found')) {
      return res.status(404).json({ message: 'Document not found' })
    }

    return res.status(500).json({
      message: 'Error generating PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
    })
  }
}
