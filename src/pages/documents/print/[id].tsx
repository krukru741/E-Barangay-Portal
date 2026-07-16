import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { QRCodeSVG } from 'qrcode.react'

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
  const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`
  const age = new Date().getFullYear() - new Date(resident.birthDate).getFullYear()
  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${documentId}` : ''

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto', bgcolor: 'white', color: 'black' }}>
      <Box sx={{ '@media print': { display: 'none' }, mb: 4, textAlign: 'center' }}>
        <Button variant="contained" onClick={handlePrint}>Print Document</Button>
        <Button sx={{ ml: 2 }} variant="outlined" onClick={() => router.push('/documents')}>Back</Button>
      </Box>

      {/* Official Document Letterhead Area */}
      <Box sx={{ textAlign: 'center', mb: 5, borderBottom: '2px solid black', pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>REPUBLIC OF THE PHILIPPINES</Typography>
        <Typography variant="subtitle1">Province of Cebu</Typography>
        <Typography variant="subtitle1">Municipality of Somewhere</Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>BARANGAY DEFAULT</Typography>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>OFFICE OF THE PUNONG BARANGAY</Typography>
      </Box>

      {/* Document Title */}
      <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 5, textTransform: 'uppercase' }}>
        {type === 'CLEARANCE' && 'BARANGAY CLEARANCE'}
        {type === 'RESIDENCY' && 'CERTIFICATE OF RESIDENCY'}
        {type === 'INDIGENCY' && 'CERTIFICATE OF INDIGENCY'}
        {type === 'BUSINESS' && 'BUSINESS CLEARANCE'}
        {type === 'GOOD_MORAL' && 'CERTIFICATE OF GOOD MORAL CHARACTER'}
        {type === 'ENDORSEMENT' && 'ENDORSEMENT LETTER'}
      </Typography>

      {/* Document Body */}
      <Box sx={{ position: 'relative', fontSize: '1.1rem', lineHeight: 2, mb: 10 }}>
        {/* Resident Photo Slot */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '2in', 
            height: '2in', 
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
            <Typography variant="caption" sx={{ color: 'gray' }}>ID PICTURE</Typography>
          )}
        </Box>

        <Typography sx={{ mb: 4, width: '70%' }}>TO WHOM IT MAY CONCERN:</Typography>
        
        {type === 'CLEARANCE' && (
          <>
            <Typography sx={{ textIndent: '40px', mb: 2, width: '70%' }}>
              This is to certify that <strong>{fullName.toUpperCase()}</strong>, {age} years of age, 
              single/married, and a bonafide resident of Barangay Default, 
              is known to me to be of good moral character and a law-abiding citizen.
            </Typography>
            <Typography sx={{ textIndent: '40px', mb: 2, clear: 'both' }}>
              This certification is issued upon the request of the above-named person for 
              <strong> {purpose.toUpperCase()}</strong> and for whatever legal purpose it may serve.
            </Typography>
          </>
        )}

        {type === 'RESIDENCY' && (
          <>
            <Typography sx={{ textIndent: '40px', mb: 2 }}>
              This is to certify that <strong>{fullName.toUpperCase()}</strong>, {age} years of age, 
              is a bonafide resident of Barangay Default, residing at {resident.household?.houseNumber} {resident.household?.street} {resident.household?.sitio} {resident.household?.purok}.
            </Typography>
            <Typography sx={{ textIndent: '40px', mb: 2 }}>
              This certification is issued upon the request of the above-named person to verify his/her place of residence.
            </Typography>
          </>
        )}

        {type === 'INDIGENCY' && (
          <>
            <Typography sx={{ textIndent: '40px', mb: 2 }}>
              This is to certify that <strong>{fullName.toUpperCase()}</strong>, {age} years of age, 
              is a bonafide resident of Barangay Default. 
            </Typography>
            <Typography sx={{ textIndent: '40px', mb: 2 }}>
              It is further certified that the above-named person belongs to an indigent family in this barangay whose income is not sufficient to meet their daily needs.
            </Typography>
          </>
        )}

        {type === 'BUSINESS' && (
          <>
            <Typography sx={{ textIndent: '40px', mb: 2 }}>
              This is to certify that <strong>{fullName.toUpperCase()}</strong>, {age} years of age, 
              has applied for a Business Clearance for the business/establishment named <strong>{businessName ? businessName.toUpperCase() : purpose.toUpperCase()}</strong> 
              {businessAddress && <span> located at <strong>{businessAddress.toUpperCase()}</strong></span>} within the jurisdiction of Barangay Default.
            </Typography>
            <Typography sx={{ textIndent: '40px', mb: 2 }}>
              The aforementioned business complies with the existing ordinances and regulations of this barangay.
            </Typography>
          </>
        )}

        {type === 'GOOD_MORAL' && (
          <Typography sx={{ textIndent: '40px', mb: 2 }}>
            This is to certify that <strong>{fullName.toUpperCase()}</strong>, of legal age, 
            {resident.civilStatus.toLowerCase()}, and a bonafide resident of 
            Barangay Default, is known to me to be of good moral character and a law-abiding citizen.
          </Typography>
        )}

        {type === 'ENDORSEMENT' && (
          <Typography sx={{ textIndent: '40px', mb: 2 }}>
            This is to respectfully endorse the request of <strong>{fullName.toUpperCase()}</strong>, a bonafide resident of Barangay Default, to your good office.
          </Typography>
        )}

        {type !== 'BUSINESS' && type !== 'ENDORSEMENT' && (
          <Typography sx={{ textIndent: '40px', mb: 2 }}>
            This certification is being issued upon the request of the above-named person for the purpose of 
            <strong> {purpose.toUpperCase()}</strong> and for whatever legal purpose it may serve.
          </Typography>
        )}

        <Typography sx={{ textIndent: '40px', mb: 4 }}>
          Given this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> at 
          Barangay Default.
        </Typography>
      </Box>

      {/* Signatures & Verification */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
        {type === 'CLEARANCE' ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <Box sx={{ width: 100, height: 100, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant='caption'>Left Thumbmark</Typography>
            </Box>
            <Box sx={{ width: 100, height: 100, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant='caption'>Right Thumbmark</Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <QRCodeSVG value={verificationUrl} size={100} />
            <Typography variant='caption' display="block" sx={{ mt: 1 }}>Scan to Verify</Typography>
          </Box>
        )}
        
        <Box sx={{ textAlign: 'center', alignSelf: 'flex-end' }}>
          <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. JUAN DELA CRUZ</Typography>
          <Typography>Punong Barangay</Typography>
        </Box>
      </Box>

      {/* Secondary Row for Clearance QR */}
      {type === 'CLEARANCE' && (
        <Box sx={{ mt: 4 }}>
          <QRCodeSVG value={verificationUrl} size={80} />
          <Typography variant='caption' display="block" sx={{ mt: 1 }}>Scan to Verify</Typography>
        </Box>
      )}

      {/* Footer Info: Receipt and Cedula */}
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid #ccc', pt: 2 }}>
        <Box>
          <Typography><strong>Reference No:</strong> {queueNumber} {urgency === 'PRIORITY' && '(PRIORITY)'}</Typography>
          <Typography><strong>Amount Paid:</strong> ₱{(feeAmount || 0).toFixed(2)}</Typography>
          {orNumber && <Typography><strong>O.R. No.:</strong> {orNumber}</Typography>}
          <Typography color="gray" sx={{ mt: 1 }}>Generated via E-Barangay Portal</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          {cedulaNumber && <Typography><strong>CTC No.:</strong> {cedulaNumber}</Typography>}
          {cedulaIssuedAt && <Typography><strong>Issued On:</strong> {new Date(cedulaIssuedAt).toLocaleDateString()}</Typography>}
          {cedulaIssuedAt && <Typography><strong>Issued At:</strong> Barangay Default</Typography>}
        </Box>
      </Box>
    </Box>
  )
}
