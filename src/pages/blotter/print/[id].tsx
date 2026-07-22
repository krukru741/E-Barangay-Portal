/**
 * /blotter/print/[id]
 *
 * Barangay Blotter Case Record — Print View
 *
 * PERFORMANCE FIX:
 * The old version used client-side useEffect + 3 separate fetch() calls:
 *   1. fetch(`/api/blotters/${id}`)
 *   2. fetch('/api/officials')
 *   3. fetch('/api/admin/settings')
 * This caused a "Loading..." flash and slow render because the data arrived
 * after the page mounted in the browser.
 *
 * NEW APPROACH — getServerSideProps:
 * All 3 queries run IN PARALLEL on the server BEFORE the HTML is sent to
 * the browser. The page arrives FULLY RENDERED — zero loading state,
 * zero client-side fetches.
 */

import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'src/pages/api/auth/[...nextauth]'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { QRCodeSVG } from 'qrcode.react'
import { prisma } from 'src/lib/db'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  blotter: any
  officials: any[]
  settings: any
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOfficialName(res: any): string {
  if (!res) return '___________________'
  return `${res.firstName} ${res.middleName ? res.middleName.charAt(0) + '. ' : ''}${res.lastName}`.toUpperCase()
}

function getAge(birthDate: string): number {
  const today = new Date()
  const bDate = new Date(birthDate)
  let age = today.getFullYear() - bDate.getFullYear()
  const m = today.getMonth() - bDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--
  return age
}

function formatParty(resident: any, nameStr: string): string {
  if (resident) {
    const name = `${resident.firstName} ${resident.middleName ? resident.middleName.charAt(0) + '. ' : ''}${resident.lastName}`.toUpperCase()
    const age = getAge(resident.birthDate)
    const civilStatus = resident.civilStatus.charAt(0).toUpperCase() + resident.civilStatus.slice(1).toLowerCase()
    let address = ''
    if (resident.household) {
      address = [resident.household.purok, resident.household.sitio, `Barangay ${resident.household.barangay}`].filter(Boolean).join(', ')
    }
    return `${name}, ${age}, ${civilStatus}, ${address || 'Talisay City'}`
  }
  return (nameStr || '___________________').toUpperCase()
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | TIME: ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BlotterPrintView({ blotter, officials, settings }: Props) {
  const router = useRouter()

  // Data arrives fully populated from getServerSideProps — no loading state needed
  const captain   = officials.find(o => o.position === 'CAPTAIN' && o.isActive)
  const secretary = officials.find(o => o.position === 'SECRETARY' && o.isActive)

  const captainName   = formatOfficialName(captain?.resident)
  const secretaryName = formatOfficialName(secretary?.resident)

  const complainantDetails = formatParty(blotter.complainant, blotter.complainantName)
  const respondentDetails  = formatParty(blotter.respondent, blotter.respondentName)

  const issuedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Box sx={{ p: 2, maxWidth: '850px', margin: '0 auto', bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', position: 'relative' }}>

      {/* Watermark Background */}
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.1, zIndex: 0, pointerEvents: 'none',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: '500px', height: '500px',
      }}>
        {settings.watermarkUrl ? (
          <img src={settings.watermarkUrl} alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', border: '5px solid #000', borderRadius: '50%' }}>
            <Typography variant="h1" sx={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
              {(settings.cityMunicipality || 'CITY').toUpperCase()}<br />SEAL
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* Print/Back buttons — hidden when printing */}
        <Box sx={{ '@media print': { display: 'none' }, mb: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => window.print()}>Print Document</Button>
          <Button sx={{ ml: 2 }} variant="outlined" onClick={() => router.back()}>Back</Button>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, pb: 2, gap: 5 }}>
          {/* Left Logo */}
          <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: settings.logoUrl ? 'none' : '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {settings.logoUrl
              ? <img src={settings.logoUrl} alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <Typography variant="caption">BRGY LOGO</Typography>}
          </Box>

          {/* Center Text */}
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="body1">Republic of the Philippines</Typography>
            <Typography variant="body1">Province of {settings.province || ''}</Typography>
            <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>{settings.cityMunicipality || ''}</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mt: 1 }}>{settings.barangayName || 'Barangay'} HALL</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>OFFICE OF THE LUPONG TAGAPAMAYAPA</Typography>
          </Box>

          {/* Right Logo */}
          <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: settings.cityLogoUrl ? 'none' : '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {settings.cityLogoUrl
              ? <img src={settings.cityLogoUrl} alt="City Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <Typography variant="caption">CITY LOGO</Typography>}
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', mt: 1, mb: 1, textTransform: 'uppercase', letterSpacing: 2 }}>
          BARANGAY BLOTTER
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>BARANGAY CASE NO.: {blotter.blotterNumber}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>DATE REPORTED: {formatDateTime(blotter.filedAt)}</Typography>
        </Box>

        {/* Main Case Box */}
        <Box sx={{ border: '2px solid black', p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.85)' }}>

          {/* Parties */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'inline' }}>Complainant: </Typography>
              <Typography variant="body2" sx={{ display: 'inline' }}>{complainantDetails}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'inline' }}>Respondent: </Typography>
              <Typography variant="body2" sx={{ display: 'inline' }}>{respondentDetails}</Typography>
            </Box>
          </Box>

          {/* Incident Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'inline' }}>Type of Incident: </Typography>
              <Typography variant="body2" sx={{ display: 'inline' }}>{blotter.incidentType}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'inline' }}>Date & Time of Incident: </Typography>
              <Typography variant="body2" sx={{ display: 'inline' }}>{formatDateTime(blotter.incidentDate)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'inline' }}>Place of Occurrence: </Typography>
              <Typography variant="body2" sx={{ display: 'inline' }}>{blotter.location}</Typography>
            </Box>
          </Box>

          {/* Witnesses */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'inline' }}>Witness(es): </Typography>
            <Typography variant="body2" sx={{ display: 'inline' }}>{blotter.witnesses || 'None'}</Typography>
          </Box>

          {/* Narrative */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', textDecoration: 'underline', mb: 0.5 }}>Narrative:</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: 1.4 }}>
              {blotter.narrative}
            </Typography>
          </Box>

          {/* Action Taken */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', textDecoration: 'underline', mb: 0.5 }}>Action Taken:</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: 1.4 }}>
              {blotter.actionTaken || 'None recorded.'}
            </Typography>
          </Box>

          {/* Hearings */}
          {blotter.hearings && blotter.hearings.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', textDecoration: 'underline', mb: 0.5 }}>Hearings & Mediation:</Typography>
              {blotter.hearings.map((h: any, i: number) => (
                <Box key={h.id} sx={{ mb: 1, pl: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Hearing {blotter.hearings.length - i} - {new Date(h.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    Outcome: {h.outcome || 'Pending'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Signature Lines */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Box sx={{ textAlign: 'center', width: '250px' }}>
              <Typography sx={{ borderBottom: '1px solid black', height: '20px' }}></Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Signature of Complainant / Date</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', width: '250px' }}>
              <Typography sx={{ borderBottom: '1px solid black', height: '20px' }}></Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Signature of Respondent / Date</Typography>
            </Box>
          </Box>
        </Box>

        {/* Case Disposition */}
        <Box sx={{ border: '2px solid black', p: 1.5, mb: 2, bgcolor: 'rgba(255,255,255,0.85)' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>CASE DISPOSITION:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[
              { label: 'Amicably Settled',       checked: blotter.status === 'RESOLVED'  },
              { label: 'Referred to PNP/Court',  checked: blotter.status === 'ESCALATED' },
              { label: 'Ongoing Investigation',   checked: ['OPEN', 'ONGOING'].includes(blotter.status) },
              { label: 'Dismissed / Closed',      checked: blotter.status === 'CLOSED'   },
            ].map(({ label, checked }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox size="small" checked={checked} sx={{ p: 0, mr: 0.5, '&.Mui-checked': { color: 'black' } }} />
                <Typography variant="body2">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Certification Footer */}
        <Typography variant="body2" sx={{ textIndent: '40px', mb: 2, textAlign: 'justify' }}>
          This is to certify that the above blotter entry is a true and faithful reproduction from the official Barangay Blotter Book.
          Issued this <strong>{issuedDate}</strong> upon the request of the interested party for whatever legal purpose it may serve.
        </Typography>

        {/* Signatories */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 4 }}>
          <Box sx={{ textAlign: 'center', width: '250px' }}>
            <Typography sx={{ borderBottom: '1px solid black', height: '15px' }}></Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>HON. {secretaryName}</Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>Barangay Secretary</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', width: '250px' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. {captainName}</Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>Punong Barangay / Lupon Chairman</Typography>
          </Box>
        </Box>

        {/* QR Code and Meta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Box>
            <QRCodeSVG value={`VERIFY-BLOTTER:${blotter.id}`} size={60} />
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'gray' }}>Scan to Verify</Typography>
          </Box>
          <Typography sx={{ textAlign: 'right', fontSize: '6pt', color: 'gray' }}>
            E-barangay Portal ©2026 - Alben Gacayan<br />
            Printed on: {new Date().toLocaleString()}
          </Typography>
        </Box>

      </Box>
    </Box>
  )
}

BlotterPrintView.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
BlotterPrintView.authGuard = false

// ─── Server-Side Data Fetching ────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string }

  try {
    // Auth check — only authenticated users can print blotter records
    const session = await getServerSession(context.req, context.res, authOptions)
    if (!session) {
      return { redirect: { destination: '/login', permanent: false } }
    }

    // Fetch all 3 data sources IN PARALLEL directly from the database.
    // This runs on the server before any HTML is sent to the browser.
    const [blotter, officials, settings] = await Promise.all([
      prisma.blotter.findUnique({
        where: { id },
        include: {
          complainant: { include: { household: true } },
          respondent:  { include: { household: true } },
          hearings:    { orderBy: { scheduledAt: 'desc' } },
        },
      }),
      prisma.official.findMany({
        where: { isActive: true },
        include: {
          resident: {
            select: { firstName: true, middleName: true, lastName: true }
          }
        },
        orderBy: { termStart: 'desc' },
      }),
      prisma.systemSettings.findFirst(),
    ])

    if (!blotter) {
      return { notFound: true }
    }

    // Prisma returns Date objects — must serialize to strings for JSON props
    const serialized = JSON.parse(JSON.stringify(blotter))

    return {
      props: {
        blotter: serialized,
        officials: JSON.parse(JSON.stringify(officials)),
        settings: settings ? JSON.parse(JSON.stringify(settings)) : {},
      },
    }
  } catch (error: any) {
    console.error('[blotter/print] getServerSideProps error:', error)
    return { notFound: true }
  }
}
