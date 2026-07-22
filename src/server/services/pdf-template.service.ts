/**
 * pdf-template.service.ts
 *
 * Server-side HTML generator for barangay document PDFs.
 *
 * WHY THIS EXISTS:
 * The old approach navigated Puppeteer to /documents/print/{id} — a Next.js
 * page that made 4 additional HTTP requests (document, officials, settings,
 * templates) and waited for React to hydrate before Puppeteer could screenshot
 * it. This caused 30–60 second generation times.
 *
 * This service REPLACES that entire flow by:
 * 1. Querying ALL needed data directly via Prisma (zero HTTP round-trips)
 * 2. Building a self-contained HTML string (inline CSS, base64 images)
 * 3. Returning the HTML string for Puppeteer to render via page.setContent()
 *
 * The /documents/print/[id].tsx React page is UNCHANGED — it still works for
 * browser preview and window.print(). Only the PDF download API uses this.
 */

import { prisma } from 'src/lib/db'
import QRCode from 'qrcode'

// Re-use the default templates from the admin API to avoid duplication
const DEFAULT_TEMPLATES: Record<string, string> = {
  CLEARANCE: `<p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify that <strong>{{fullName}}</strong>, {{age}} years of age,
    is a bona fide resident of {{address}}.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify further that he/she is known to us personally as a person of good moral character
    and has no criminal record and no disciplinary action against this barangay.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This certification is hereby issued upon the request of the abovementioned person in connection
    to his/her application for <strong>{{purpose}}</strong> or for whatever legal purpose that may serve him/her best.
  </p>`,
  RESIDENCY: `<p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify that <strong>{{fullName}}</strong>, {{age}} years of age,
    is a bona fide resident of {{address}}.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    Based on records of this office, he/she has been residing in this barangay and is known to be a law-abiding citizen of good moral character.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This certification is being issued upon the request of the above-named person for <strong>{{purpose}}</strong> or whatever legal purposes it may serve.
  </p>`,
  INDIGENCY: `<p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify that <strong>{{fullName}}</strong>, {{age}} years of age,
    is a bona fide resident of {{address}}.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This further certifies that the above-named person belongs to an indigent family in our barangay whose combined family income is insufficient to support their basic needs.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This certification is being issued upon the request of the above-named person for <strong>{{purpose}}</strong> or whatever legal purposes it may serve.
  </p>`,
  GOOD_MORAL: `<p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify that <strong>{{fullName}}</strong>, {{age}} years of age,
    is a bona fide resident of {{address}}.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify further that he/she is a person of good moral character, has no derogatory record on file, and is a law-abiding citizen in this community.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This certification is hereby issued upon the request of the abovementioned person for <strong>{{purpose}}</strong>.
  </p>`,
  BUSINESS: `<p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This is to certify that the business or trade activity described below:
  </p>
  <div style="margin-left:40px;margin-bottom:16px;">
    <p><strong>Business Name:</strong> {{businessName}}</p>
    <p><strong>Address:</strong> {{businessAddress}}</p>
    <p><strong>Operator/Owner:</strong> {{fullName}}</p>
  </div>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    has been granted a Barangay Clearance to operate within the territorial jurisdiction of this barangay, subject to the provisions of existing laws and ordinances.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This clearance is granted for the purpose of securing a <strong>{{purpose}}</strong>.
  </p>`,
  ENDORSEMENT: `<p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    This office respectfully endorses the application of <strong>{{fullName}}</strong>, {{age}} years of age,
    and a bona fide resident of {{address}}.
  </p>
  <p style="text-indent:40px;margin-bottom:16px;text-align:justify;">
    The aforementioned individual is being endorsed for <strong>{{purpose}}</strong>. Any assistance extended to him/her will be highly appreciated by this office.
  </p>`,
}

const DOC_TITLES: Record<string, string> = {
  CLEARANCE: 'BARANGAY CLEARANCE',
  RESIDENCY: 'CERTIFICATE OF RESIDENCY',
  INDIGENCY: 'CERTIFICATE OF INDIGENCY',
  BUSINESS: 'BUSINESS CLEARANCE',
  GOOD_MORAL: 'CERTIFICATE OF GOOD MORAL CHARACTER',
  ENDORSEMENT: 'ENDORSEMENT LETTER',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatOfficialName(res: { firstName: string; middleName?: string | null; lastName: string } | null | undefined): string {
  if (!res) return '___________________'
  const mid = res.middleName ? `${res.middleName.charAt(0)}. ` : ''
  return `${res.firstName} ${mid}${res.lastName}`.toUpperCase()
}

function formatAddress(household: any): string {
  if (!household) return '__________'
  const parts: string[] = []
  const h = household

  if (h.houseNumber && h.houseNumber.toLowerCase() !== 'n/a') parts.push(`House No. ${h.houseNumber}`)
  if (h.street && h.street.toLowerCase() !== 'n/a') parts.push(h.street)
  if (h.village && h.village.toLowerCase() !== 'n/a') parts.push(h.village)
  if (h.sitio && h.sitio.toLowerCase() !== 'n/a') parts.push(`Sitio ${h.sitio.charAt(0).toUpperCase() + h.sitio.slice(1)}`)
  if (h.purok && h.purok.toLowerCase() !== 'n/a') {
    let p = h.purok.charAt(0).toUpperCase() + h.purok.slice(1)
    if (!p.toLowerCase().startsWith('purok')) p = `Purok ${p}`
    parts.push(p)
  }

  let brgy = h.barangay || 'Poblacion'
  if (brgy.toLowerCase().startsWith('barangay ')) brgy = brgy.substring(9).trim()
  parts.push(`Barangay ${brgy}`)
  parts.push(h.city || 'Talisay City')
  parts.push(`${h.province || 'Cebu'}${h.postalCode ? ' ' + h.postalCode : ''}`)
  parts.push((h.country || 'Philippines').toUpperCase())

  return parts.join(', ')
}

/** Converts an image URL (data: or http/s) to a data: URI string for embedding. */
async function toDataUri(url: string | null | undefined): Promise<string> {
  if (!url) return ''
  // Already a data URI (base64 stored in DB) — return as-is
  if (url.startsWith('data:')) return url
  // HTTP/HTTPS URL — fetch and convert to base64 using Node.js built-ins
  try {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const lib = url.startsWith('https') ? require('https') : require('http')
      lib.get(url, { timeout: 5000 }, (res: any) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      }).on('error', reject)
    })
    // Guess MIME type from URL extension
    const ext = url.split('.').pop()?.toLowerCase() || 'png'
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'svg' ? 'image/svg+xml'
      : ext === 'webp' ? 'image/webp'
      : 'image/png'
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return '' // Fail silently — image will be missing but PDF still generates
  }
}

// ─── Main Export ───────────────────────────────────────────────────────────

/**
 * Fetches all data needed for a document PDF directly from the database,
 * then returns a fully self-contained HTML string ready for Puppeteer.
 *
 * @param documentId - The DocumentRequest.id
 * @param baseUrl    - The origin URL (e.g. "http://localhost:3000") for QR code generation
 * @param pageFormat - 'A4' | 'Legal'
 */
export async function buildDocumentHtml(
  documentId: string,
  baseUrl: string,
  pageFormat: 'A4' | 'Legal' = 'A4'
): Promise<{ html: string; format: 'A4' | 'Legal' }> {

  // ── Step 1: Fetch document + officials + settings in parallel ──────────
  const [doc, officials, settings] = await Promise.all([
    prisma.documentRequest.findUnique({
      where: { id: documentId },
      include: {
        resident: {
          include: { household: true }
        }
      }
    }),
    prisma.official.findMany({
      where: { isActive: true },
      include: {
        resident: {
          select: { firstName: true, middleName: true, lastName: true }
        }
      },
      orderBy: { termStart: 'desc' }
    }),
    prisma.systemSettings.findFirst(),
  ])

  if (!doc || !doc.resident) {
    throw new Error(`Document ${documentId} not found`)
  }

  // Fetch the template for this specific doc type (needs doc.type first)
  const templateRecord = await prisma.documentTemplate.findFirst({
    where: { type: doc.type }
  })

  // ── Step 2: Prepare data ────────────────────────────────────────────────
  const { resident, type, purpose, queueNumber, cedulaNumber, businessName, businessAddress } = doc
  const household = resident.household

  const fullName = `${resident.lastName}, ${resident.firstName}${resident.middleName ? ' ' + resident.middleName : ''}`.trim()
  const age = new Date().getFullYear() - new Date(resident.birthDate).getFullYear()
  const fullAddress = formatAddress(household)
  const verificationUrl = `${baseUrl}/verify/${documentId}`
  const issuedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  // Officials
  const captain   = officials.find(o => o.position === 'CAPTAIN')
  const treasurer = officials.find(o => o.position === 'TREASURER')
  const secretary = officials.find(o => o.position === 'SECRETARY')
  const skChair   = officials.find(o => o.position === 'SK_CHAIR')
  const kagawads  = officials.filter(o => o.position === 'KAGAWAD')

  const captainName   = formatOfficialName(captain?.resident)
  const treasurerName = formatOfficialName(treasurer?.resident)
  const secretaryName = formatOfficialName(secretary?.resident)
  const skChairName   = formatOfficialName(skChair?.resident)

  // ── Step 3: Resolve template body ──────────────────────────────────────
  let templateHtml = templateRecord?.contentHtml || DEFAULT_TEMPLATES[type] || ''
  templateHtml = templateHtml
    .replace(/{{fullName}}/g, fullName.toUpperCase())
    .replace(/{{address}}/g, fullAddress)
    .replace(/{{purpose}}/g, (purpose || '').toUpperCase())
    .replace(/{{age}}/g, String(age))
    .replace(/{{civilStatus}}/g, resident.civilStatus || '')
    .replace(/{{businessName}}/g, (businessName || '').toUpperCase())
    .replace(/{{businessAddress}}/g, (businessAddress || '').toUpperCase())

  // ── Step 4: Convert images to base64 (runs in parallel) ────────────────
  const [logoDataUri, cityLogoDataUri, watermarkDataUri, qrDataUri, photoDataUri] =
    await Promise.all([
      toDataUri(settings?.logoUrl),
      toDataUri(settings?.cityLogoUrl),
      toDataUri(settings?.watermarkUrl),
      QRCode.toDataURL(verificationUrl, { width: 100, margin: 0 }),
      toDataUri(resident.photo), // photo is already base64 in DB
    ])

  // ── Step 5: Build self-contained HTML ──────────────────────────────────
  const kagawadRows = kagawads.map(k =>
    `<p style="font-weight:bold;font-size:11px;margin:2px 0;">HON. ${formatOfficialName(k.resident)}</p>`
  ).join('')

  const skChairHtml = skChair
    ? `<p style="font-weight:bold;font-size:11px;margin:2px 0;">HON. ${skChairName}</p>`
    : ''

  const logoHtml = logoDataUri
    ? `<img src="${logoDataUri}" alt="Barangay Logo" style="width:80px;height:80px;object-fit:cover;border-radius:50%;">`
    : `<div style="width:80px;height:80px;border:1px solid #000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:#666;">BRGY LOGO</div>`

  const cityLogoHtml = cityLogoDataUri
    ? `<img src="${cityLogoDataUri}" alt="City Logo" style="width:80px;height:80px;object-fit:cover;border-radius:50%;">`
    : `<div style="width:80px;height:80px;border:1px solid #000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:#666;">CITY LOGO</div>`

  const watermarkHtml = watermarkDataUri
    ? `<img src="${watermarkDataUri}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<div style="width:100%;height:100%;border:5px solid #000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;text-align:center;">TALISAY CITY<br>SEAL</div>`

  const photoHtml = photoDataUri
    ? `<img src="${photoDataUri}" alt="ID Photo" style="width:100%;height:100%;object-fit:cover;">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:7px;color:#999;">ID PICTURE</div>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${DOC_TITLES[type] || type}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #000;
    background: #fff;
    padding: 24px;
    max-width: 850px;
    margin: 0 auto;
    position: relative;
  }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 400px;
    opacity: 0.07;
    z-index: 0;
    pointer-events: none;
  }
  .content { position: relative; z-index: 1; }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #000;
  }
  .header-text { text-align: center; }
  .header-text p { margin: 1px 0; font-size: 11px; }
  .doc-title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 16px 0 20px;
  }
  .two-col { display: flex; gap: 24px; }
  .officials-col {
    width: 30%;
    border-right: 1px dashed #ccc;
    padding-right: 12px;
    font-size: 10px;
  }
  .officials-col .section-title {
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    font-size: 10px;
  }
  .official-name {
    font-weight: bold;
    text-decoration: underline;
    text-align: center;
    display: block;
    font-size: 10px;
    margin: 2px 0;
  }
  .official-title {
    text-align: center;
    display: block;
    font-size: 9px;
    margin-bottom: 6px;
  }
  .body-col { width: 70%; padding-left: 12px; }
  .greeting { margin-bottom: 16px; font-size: 12px; }
  .template-body { font-size: 12px; line-height: 1.6; }
  .issued-line { text-indent: 40px; margin: 20px 0 24px; font-size: 12px; }
  .sig-section { display: flex; gap: 16px; margin-bottom: 20px; }
  .sig-box { width: 110px; }
  .sig-name {
    font-weight: bold;
    text-decoration: underline;
    text-align: center;
    font-size: 10px;
    word-break: break-word;
  }
  .sig-label { text-align: center; font-size: 9px; font-style: italic; }
  .id-photo {
    width: 1.1in; height: 1.1in;
    border: 1px solid #000;
    overflow: hidden;
  }
  .qr-box { width: 1.1in; height: 1.1in; }
  .qr-box img { width: 100%; height: 100%; }
  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
  }
  .details-table { font-size: 10px; line-height: 1.8; }
  .detail-row { display: flex; gap: 4px; }
  .detail-label { width: 80px; flex-shrink: 0; }
  .detail-value {
    border-bottom: 1px solid #000;
    flex: 1;
    min-width: 120px;
  }
  .captain-sig { text-align: center; }
  .captain-sig .name { font-weight: bold; text-decoration: underline; font-size: 12px; }
  .captain-sig .title { font-size: 10px; font-style: italic; }
  .not-valid { font-style: italic; font-size: 10px; margin-top: 8px; }
  .copyright { text-align: center; margin-top: 20px; font-size: 6pt; color: #999; }
</style>
</head>
<body>

<!-- Watermark -->
<div class="watermark">${watermarkHtml}</div>

<div class="content">

  <!-- Header -->
  <div class="header">
    ${logoHtml}
    <div class="header-text">
      <p>Republic of the Philippines</p>
      <p>Province of ${settings?.province || 'Cebu'}</p>
      <p style="text-transform:uppercase;">${settings?.cityMunicipality || 'Talisay City'}</p>
      <p style="font-weight:bold;text-transform:uppercase;margin-top:4px;">${settings?.barangayName || 'Barangay'} HALL</p>
      <p style="font-weight:bold;font-size:13px;margin-top:4px;">OFFICE OF THE BARANGAY CAPTAIN</p>
    </div>
    ${cityLogoHtml}
  </div>

  <!-- Document Title -->
  <div class="doc-title">${DOC_TITLES[type] || type}</div>

  <!-- Two Column Layout -->
  <div class="two-col">

    <!-- Left: Officials -->
    <div class="officials-col">
      <div class="section-title">BARANGAY OFFICIALS</div>

      <div style="text-align:center;margin-bottom:10px;">
        <span class="official-name">HON. ${captainName}</span>
        <span class="official-title">Punong Barangay</span>
      </div>

      <div class="section-title" style="font-size:9px;">SANGGUNIANG BARANGAY<br>MEMBERS</div>

      <div style="text-align:center;margin-bottom:8px;">
        ${kagawadRows || '<p style="font-size:9px;color:gray;">No Kagawads found</p>'}
        ${skChairHtml}
      </div>

      <div style="text-align:center;margin-bottom:6px;">
        <span style="text-decoration:underline;display:block;font-size:10px;">Barangay Treasurer</span>
        <span style="font-weight:bold;font-size:10px;">${treasurerName}</span>
      </div>

      <div style="text-align:center;">
        <span style="text-decoration:underline;display:block;font-size:10px;">Barangay Secretary</span>
        <span style="font-weight:bold;font-size:10px;">${secretaryName}</span>
      </div>
    </div>

    <!-- Right: Document Body -->
    <div class="body-col">
      <p class="greeting">TO WHOM IT MAY CONCERN:</p>

      <div class="template-body">${templateHtml}</div>

      <p class="issued-line">
        Issued this <strong>${issuedDate}</strong>.
      </p>

      <!-- Applicant Signature -->
      <div style="margin-bottom:8px;width:220px;">
        <div class="sig-name">${fullName.toUpperCase()}</div>
        <div class="sig-label">Signature of Applicant</div>
      </div>

      <!-- Photo + QR Code -->
      <div class="sig-section">
        <div class="id-photo">${photoHtml}</div>
        <div class="qr-box">
          <img src="${qrDataUri}" alt="QR Code for verification">
        </div>
      </div>

      <!-- Footer Row -->
      <div class="footer-row">
        <div>
          <div class="details-table">
            <div class="detail-row">
              <span class="detail-label">Clearance #:</span>
              <span class="detail-value">${queueNumber || ''}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Res. Cert. #:</span>
              <span class="detail-value">${cedulaNumber || ''}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Issued on:</span>
              <span class="detail-value">${new Date().toLocaleDateString('en-US')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Issued at:</span>
              <span class="detail-value">BRGY. ${(household?.barangay || '').toUpperCase()}, ${(settings?.cityMunicipality || 'TALISAY CITY').toUpperCase()}</span>
            </div>
          </div>
          <p class="not-valid">Not valid without official seal.</p>
        </div>

        <div class="captain-sig">
          <div class="name">HON. ${captainName}</div>
          <div class="title">Barangay Captain</div>
        </div>
      </div>

    </div>
  </div>

  <p class="copyright">Visits E-barangay Portal ©2026 - Alben Gacayan. All rights reserved</p>
</div>

</body>
</html>`

  return { html, format: pageFormat }
}
