import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

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

  const { resident, type, purpose, queueNumber } = documentData
  const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`

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
        {type.replace('_', ' ')}
      </Typography>

      {/* Document Body */}
      <Box sx={{ fontSize: '1.1rem', lineHeight: 2, mb: 10 }}>
        <Typography sx={{ mb: 4 }}>TO WHOM IT MAY CONCERN:</Typography>
        
        <Typography sx={{ textIndent: '40px', mb: 2 }}>
          This is to certify that <strong>{fullName.toUpperCase()}</strong>, of legal age, 
          {resident.civilStatus.toLowerCase()}, and a bonafide resident of 
          Barangay Default, is known to me to be of good moral character and a law-abiding citizen.
        </Typography>

        <Typography sx={{ textIndent: '40px', mb: 2 }}>
          This certification is being issued upon the request of the above-named person for the purpose of 
          <strong> {purpose.toUpperCase()}</strong> and for whatever legal purpose it may serve.
        </Typography>

        <Typography sx={{ textIndent: '40px', mb: 4 }}>
          Given this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> at 
          Barangay Default.
        </Typography>
      </Box>

      {/* Signatures */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 10 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. JUAN DELA CRUZ</Typography>
          <Typography>Punong Barangay</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 5, fontSize: '0.8rem', color: 'gray' }}>
        <Typography>Reference No: {queueNumber}</Typography>
        <Typography>Generated via E-Barangay Portal</Typography>
      </Box>
    </Box>
  )
}
