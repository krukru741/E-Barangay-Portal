import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import QRCode from 'qrcode.react'

export default function BlotterPrintView() {
  const router = useRouter()
  const { id } = router.query
  const [blotter, setBlotter] = useState<any>(null)
  const [officials, setOfficials] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      fetch(`/api/blotters/${id}`)
        .then(res => res.json())
        .then(data => setBlotter(data))
      
      fetch('/api/officials')
        .then(res => res.json())
        .then(data => setOfficials(Array.isArray(data) ? data : []))
    }
  }, [id])

  if (!blotter) return <Typography>Loading...</Typography>

  const captain = officials.find(o => o.position === 'CAPTAIN' && o.isActive)
  const secretary = officials.find(o => o.position === 'SECRETARY' && o.isActive)

  const formatName = (res: any) => {
    if (!res) return '___________________'
    return `${res.firstName} ${res.middleName ? res.middleName.charAt(0) + '. ' : ''}${res.lastName}`.toUpperCase()
  }

  const captainName = formatName(captain?.resident)
  const secretaryName = formatName(secretary?.resident)

  const complainantName = blotter.complainant 
    ? `${blotter.complainant.firstName} ${blotter.complainant.lastName}`.toUpperCase()
    : (blotter.complainantName || '___________________').toUpperCase()

  const respondentName = blotter.respondent
    ? `${blotter.respondent.firstName} ${blotter.respondent.lastName}`.toUpperCase()
    : (blotter.respondentName || '___________________').toUpperCase()

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box sx={{ p: 4, maxWidth: '850px', margin: '0 auto', bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      
      {/* Watermark */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.1,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '500px',
        height: '500px',
        border: '5px solid #000', // Placeholder if no real logo
        borderRadius: '50%',
      }}>
        <Typography variant="h1" sx={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
          TALISAY CITY<br/>SEAL
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ '@media print': { display: 'none' }, mb: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={handlePrint}>Print Record</Button>
          <Button sx={{ ml: 2 }} variant="outlined" onClick={() => router.push(`/blotter/${id}`)}>Back</Button>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '2px solid black' }}>
          <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
            <Typography variant="caption">CITY LOGO</Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1">Republic of the Philippines</Typography>
            <Typography variant="body1">Province of Cebu</Typography>
            <Typography variant="body1">TALISAY CITY</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Barangay Camp 4</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>OFFICE OF THE LUPONG TAGAPAMAYAPA</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Contact: (032) 123-4567 | Email: camp4@talisaycity.gov.ph</Typography>
          </Box>

          <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
            <Typography variant="caption">BRGY LOGO</Typography>
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mt: 4, mb: 1, textTransform: 'uppercase', letterSpacing: 2 }}>
          BARANGAY BLOTTER EXTRACT
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, px: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Document Control No: {blotter.blotterNumber}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Date Filed: {new Date(blotter.filedAt).toLocaleDateString()}</Typography>
        </Box>

        <Box sx={{ border: '2px solid black', p: 4, mb: 4, bgcolor: 'rgba(255, 255, 255, 0.85)' }}>
          
          {/* Parties */}
          <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>COMPLAINANT(S):</Typography>
              <Typography sx={{ mt: 1, fontWeight: 'bold', fontSize: '1.1rem' }}>{complainantName}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>RESPONDENT(S):</Typography>
              <Typography sx={{ mt: 1, fontWeight: 'bold', fontSize: '1.1rem' }}>{respondentName}</Typography>
            </Box>
          </Box>

          {/* Incident Info */}
          <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>Nature of Blotter: </Typography>
              <Typography sx={{ display: 'inline', textTransform: 'uppercase' }}>Alleged {blotter.incidentType}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>Incident Date/Time: </Typography>
              <Typography sx={{ display: 'inline' }}>{new Date(blotter.incidentDate).toLocaleString()}</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>Location of Incident: </Typography>
            <Typography sx={{ display: 'inline' }}>{blotter.location}</Typography>
          </Box>

          {/* Witnesses */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>WITNESS(ES):</Typography>
            <Typography sx={{ mt: 1 }}>{blotter.witnesses || 'None'}</Typography>
          </Box>

          {/* Narrative */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', mb: 2 }}>INCIDENT NARRATIVE:</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: 1.6, minHeight: '150px' }}>
              {blotter.narrative}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
            <Box sx={{ textAlign: 'center', width: '250px' }}>
              <Typography sx={{ borderBottom: '1px solid black', height: '30px' }}></Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Signature of Complainant / Date</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', width: '250px' }}>
              <Typography sx={{ borderBottom: '1px solid black', height: '30px' }}></Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Signature of Respondent / Date</Typography>
            </Box>
          </Box>
        </Box>

        {/* Case Disposition */}
        <Box sx={{ border: '2px solid black', p: 3, mb: 4, bgcolor: 'rgba(255, 255, 255, 0.85)' }}>
          <Typography sx={{ fontWeight: 'bold', mb: 2 }}>CASE DISPOSITION:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox size="small" checked={blotter.status === 'RESOLVED'} sx={{ p: 0, mr: 1, '&.Mui-checked': { color: 'black' } }} />
              <Typography>Amicably Settled (Panag-uyon)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox size="small" checked={blotter.status === 'ESCALATED'} sx={{ p: 0, mr: 1, '&.Mui-checked': { color: 'black' } }} />
              <Typography>Referred to PNP/Court</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox size="small" checked={['OPEN', 'MEDIATION'].includes(blotter.status)} sx={{ p: 0, mr: 1, '&.Mui-checked': { color: 'black' } }} />
              <Typography>Ongoing Investigation</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox size="small" checked={blotter.status === 'CLOSED'} sx={{ p: 0, mr: 1, '&.Mui-checked': { color: 'black' } }} />
              <Typography>Dismissed / Closed</Typography>
            </Box>
          </Box>
        </Box>

        {/* Certification Footer */}
        <Typography sx={{ textIndent: '40px', mb: 4, textAlign: 'justify' }}>
          This is to certify that the above blotter entry is a true and faithful reproduction from the official Barangay Blotter Book. 
          Issued this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> upon the request of the interested party for whatever legal purpose it may serve.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 8 }}>
          
          <Box sx={{ textAlign: 'center', width: '250px' }}>
            <Typography sx={{ borderBottom: '1px solid black', height: '20px' }}></Typography>
            <Typography sx={{ fontWeight: 'bold' }}>Assigned Desk Officer</Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>Signature over printed name / Date</Typography>
          </Box>

          <Box sx={{ textAlign: 'center', width: '250px' }}>
            <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. {captainName}</Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>Punong Barangay / Lupon Chairman</Typography>
          </Box>
        </Box>

        {/* QR Code and Meta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 8 }}>
          <Box>
            <QRCode value={`VERIFY-BLOTTER:${blotter.id}`} size={80} />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'gray' }}>Scan to Verify</Typography>
          </Box>
          <Typography sx={{ textAlign: 'right', fontSize: '7pt', color: 'gray' }}>
            E-barangay Portal ©2026 - Alben Gacayan<br/>
            Printed on: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

BlotterPrintView.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
