import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { QRCodeSVG } from 'qrcode.react'
import { ReactNode } from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'

export default function DocumentPrintView() {
  const router = useRouter()
  const { id } = router.query
  const [documentData, setDocumentData] = useState<any>(null)

  useEffect(() => {
    if (id) {
      fetch(`/api/documents/${id}`)
        .then(res => res.json())
        .then(data => setDocumentData(data))
    }
  }, [id])

  if (!documentData) return <Typography>Loading...</Typography>

  const { resident, type, purpose, queueNumber, id: documentId, cedulaNumber, cedulaIssuedAt, orNumber, feeAmount, businessName, businessAddress, urgency } = documentData
  
  // Format Name: LAST NAME, FIRST NAME MIDDLE NAME
  const titlePrefix = resident.gender === 'FEMALE' ? 'Ms.' : 'Mr.'
  const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName ? resident.middleName : ''}`.trim()
  const age = new Date().getFullYear() - new Date(resident.birthDate).getFullYear()
  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${documentId}` : ''
  const sitio = resident.household?.sitio ? resident.household.sitio.charAt(0).toUpperCase() + resident.household.sitio.slice(1) : '__________'
  const purok = resident.household?.purok ? resident.household.purok.charAt(0).toUpperCase() + resident.household.purok.slice(1) : '__________'

  const handlePrint = () => {
    window.print()
  }

  // Placeholder arrays for officials (can be swapped with DB fetch later)
  const kagawads = [
    "HON. ROMULO GOMEZ JR.",
    "HON. DENNIS GOMEZ",
    "HON. ANABELLA ADLAWAN",
    "HON. LUCIA ECHAVEZ",
    "HON. ROMEO BONGHANOY",
    "HON. MARCIAL BREGONDO",
    "HON. JEANETH KYAMKO"
  ]

  const skChairman = "HON. JESSABEL B. ABASTAS"

  return (
    <Box sx={{ p: 4, maxWidth: '850px', margin: '0 auto', bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
      <Box sx={{ '@media print': { display: 'none' }, mb: 4, textAlign: 'center' }}>
        <Button variant="contained" onClick={handlePrint}>Print Document</Button>
        <Button sx={{ ml: 2 }} variant="outlined" onClick={() => router.push('/documents')}>Back</Button>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2 }}>
        {/* Left Logo Placehoder */}
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption">CITY LOGO</Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1">Republic of the Philippines</Typography>
          <Typography variant="body1">Province of Cebu</Typography>
          <Typography variant="body1">TALISAY CITY</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Barangay Camp 4</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>OFFICE OF THE BARANGAY CAPTAIN</Typography>
        </Box>

        {/* Right Logo Placehoder */}
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption">BRGY LOGO</Typography>
        </Box>
      </Box>

      {/* Document Title */}
      <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4, textTransform: 'uppercase', letterSpacing: 2 }}>
        {type === 'CLEARANCE' && 'BARANGAY CLEARANCE'}
        {type === 'RESIDENCY' && 'CERTIFICATE OF RESIDENCY'}
        {type === 'INDIGENCY' && 'CERTIFICATE OF INDIGENCY'}
        {type === 'BUSINESS' && 'BUSINESS CLEARANCE'}
        {type === 'GOOD_MORAL' && 'CERTIFICATE OF GOOD MORAL CHARACTER'}
        {type === 'ENDORSEMENT' && 'ENDORSEMENT LETTER'}
      </Typography>

      {/* Two Column Layout */}
      <Box sx={{ display: 'flex', gap: 4 }}>
        
        {/* Left Column - Officials */}
        <Box sx={{ width: '30%', borderRight: '1px dashed #ccc', pr: 2 }}>
          <Typography sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>BARANGAY OFFICIALS</Typography>
          
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. ROWENA EDAR</Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>Punong Barangay</Typography>
          </Box>

          <Typography sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2, fontSize: '0.9rem' }}>
            SANGGUNIANG BARANGAY<br/>MEMBERS
          </Typography>

          <Box sx={{ textAlign: 'center', mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {kagawads.map((name, i) => (
              <Typography key={i} variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{name}</Typography>
            ))}
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1, fontSize: '0.85rem' }}>{skChairman}</Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography sx={{ textDecoration: 'underline' }}>Barangay Treasurer</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '0.85rem' }}>ANNABELLE D. ABATAYO</Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ textDecoration: 'underline' }}>Barangay Secretary</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '0.85rem' }}>MARIA JONALY LABITAD</Typography>
          </Box>
        </Box>

        {/* Right Column - Document Body */}
        <Box sx={{ width: '70%', pl: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ mb: 4 }}>TO WHOM IT MAY CONCERN:</Typography>
          
          {type === 'CLEARANCE' && (
            <>
              <Typography sx={{ textIndent: '40px', mb: 2, textAlign: 'justify' }}>
                This is to certify that {titlePrefix} <strong>{fullName.toUpperCase()}</strong>, {age} years of age, 
                is a bona fide resident of Sitio {sitio}, Purok {purok}, 
                Barangay Camp 4, Talisay City, Cebu.
              </Typography>
              <Typography sx={{ textIndent: '40px', mb: 2, textAlign: 'justify' }}>
                This is to certify further that he/she is known to us personally as a person of good moral character 
                and has no criminal record and no disciplinary action against this barangay.
              </Typography>
              <Typography sx={{ textIndent: '40px', mb: 2, textAlign: 'justify' }}>
                This certification is hereby issued upon the request of the abovementioned person in connection 
                to his/her application for <strong>{purpose.toUpperCase()}</strong> or for whatever legal purpose that may serve him/her best.
              </Typography>
            </>
          )}

          {/* Fallback for other document types */}
          {type !== 'CLEARANCE' && (
            <Typography sx={{ textIndent: '40px', mb: 2, textAlign: 'justify' }}>
               This is to certify that {titlePrefix} <strong>{fullName.toUpperCase()}</strong>, {age} years of age, 
               is a bona fide resident of Barangay Camp 4, Talisay City, Cebu. 
               This certification is issued for <strong>{purpose.toUpperCase()}</strong>.
            </Typography>
          )}

          <Typography sx={{ textIndent: '40px', mb: 6 }}>
            Issued this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
          </Typography>

          {/* Signature and Photo Area */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, width: '250px' }}>
              <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center' }}>
                {fullName.toUpperCase()}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', fontStyle: 'italic' }}>
                Signature of Applicant
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 4 }}>
              {/* Photo Box */}
              <Box 
                sx={{ 
                  width: '1.2in', 
                  height: '1.2in', 
                  border: '1px solid black', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {resident.photo ? (
                  <img src={resident.photo} alt="Resident ID" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography variant="caption" sx={{ color: 'gray', fontSize: '0.6rem' }}>ID PICTURE</Typography>
                )}
              </Box>
              
              {/* QR Code Box */}
              <Box sx={{ width: '1.2in', height: '1.2in', p: 0.5 }}>
                <QRCodeSVG value={verificationUrl} size={100} style={{ width: '100%', height: '100%' }} />
              </Box>
            </Box>
          </Box>

          {/* Table / Details Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto' }}>
            <Box>
              <Box sx={{ fontSize: '0.85rem', lineHeight: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" sx={{ width: 80 }}>Clearance #:</Typography>
                  <Typography variant="caption" sx={{ borderBottom: '1px solid black', flex: 1, minWidth: 150 }}>{queueNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" sx={{ width: 80 }}>Res. Cert. #:</Typography>
                  <Typography variant="caption" sx={{ borderBottom: '1px solid black', flex: 1 }}>{cedulaNumber || ''}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" sx={{ width: 80 }}>Issued on:</Typography>
                  <Typography variant="caption" sx={{ borderBottom: '1px solid black', flex: 1 }}>
                     {new Date().toLocaleDateString('en-US')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" sx={{ width: 80 }}>Issued at:</Typography>
                  <Typography variant="caption" sx={{ borderBottom: '1px solid black', flex: 1 }}>CAMP 4, TALISAY CITY, CEBU</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Not valid without official seal.</Typography>
            </Box>

            <Box sx={{ textAlign: 'center', pb: 4 }}>
              <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. ROWENA EDAR</Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>Barangay Captain</Typography>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  )
}

DocumentPrintView.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
