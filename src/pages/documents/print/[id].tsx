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
  const [officials, setOfficials] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({
    barangayName: 'Barangay',
    cityMunicipality: 'City',
    province: 'Province',
    logoUrl: ''
  })
  const [template, setTemplate] = useState<any>(null)

  useEffect(() => {
    if (id) {
      Promise.all([
        fetch(`/api/documents/${id}`).then(r => r.json()),
        fetch('/api/officials').then(r => r.json()),
        fetch('/api/admin/settings').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([docData, offs, sett]) => {
        setDocumentData(docData)
        setOfficials(Array.isArray(offs) ? offs : [])
        if (sett) setSettings(sett)
        // Fetch template for this doc type after we know the type
        if (docData?.type) {
          fetch('/api/admin/templates')
            .then(r => r.json())
            .then((temps: any[]) => {
              const found = temps.find(t => t.type === docData.type)
              if (found) setTemplate(found)
            })
            .catch(() => null)
        }
      })
    }
  }, [id])

  if (!documentData || !template) return <Typography>Loading...</Typography>

  const { resident, type, purpose, queueNumber, id: documentId, cedulaNumber, cedulaIssuedAt, orNumber, feeAmount, businessName, businessAddress, urgency } = documentData
  
  // Format Name: LAST NAME, FIRST NAME MIDDLE NAME
  const titlePrefix = resident.gender === 'FEMALE' ? 'Ms.' : 'Mr.'
  const fullName = `${resident.lastName}, ${resident.firstName} ${resident.middleName ? resident.middleName : ''}`.trim()
  const age = new Date().getFullYear() - new Date(resident.birthDate).getFullYear()
  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${documentId}` : ''
  const sitio = resident.household?.sitio ? resident.household.sitio.charAt(0).toUpperCase() + resident.household.sitio.slice(1) : '__________'
  const purok = resident.household?.purok ? resident.household.purok.charAt(0).toUpperCase() + resident.household.purok.slice(1) : '__________'

  // Helper function para sa limpyo nga address rendering
  const formatAddress = (residentData: any) => {
    if (!residentData?.household) return '__________'
    const parts = []
    const h = residentData.household
    
    if (h.houseNumber && h.houseNumber.toLowerCase() !== 'n/a') {
      parts.push(`House No. ${h.houseNumber}`)
    }
    if (h.street && h.street.toLowerCase() !== 'n/a') {
      parts.push(h.street)
    }
    if (h.village && h.village.toLowerCase() !== 'n/a') {
      parts.push(h.village)
    }
    if (h.sitio && h.sitio.toLowerCase() !== 'n/a') {
      parts.push(`Sitio ${h.sitio.charAt(0).toUpperCase() + h.sitio.slice(1)}`)
    }
    if (h.purok && h.purok.toLowerCase() !== 'n/a') {
      let p = h.purok.charAt(0).toUpperCase() + h.purok.slice(1)
      if (!p.toLowerCase().startsWith('purok')) p = `Purok ${p}`
      parts.push(p)
    }
    
    // Limpyohan ang Barangay field aron malikayan ang double "Barangay"
    let brgy = h.barangay || "Poblacion"
    if (brgy.toLowerCase().startsWith("barangay ")) {
      brgy = brgy.substring(9).trim()
    }
    parts.push(`Barangay ${brgy}`)

    // I-add ang Municipality ug Province
    const city = h.city || "Talisay City"
    const province = h.province || "Cebu"
    const postalCode = h.postalCode ? ` ${h.postalCode}` : ""
    const country = h.country || "Philippines"

    parts.push(city)
    parts.push(`${province}${postalCode}`)
    parts.push(country.toUpperCase())

    return parts.join(", ")
  }

  const fullAddress = formatAddress(resident)

  const handlePrint = () => {
    window.print()
  }

  // Find active officials
  const captain = officials.find(o => o.position === 'CAPTAIN' && o.isActive)
  const treasurer = officials.find(o => o.position === 'TREASURER' && o.isActive)
  const secretary = officials.find(o => o.position === 'SECRETARY' && o.isActive)
  const skChair = officials.find(o => o.position === 'SK_CHAIR' && o.isActive)
  const kagawads = officials.filter(o => o.position === 'KAGAWAD' && o.isActive)

  const formatName = (res: any) => {
    if (!res) return '___________________'
    return `${res.firstName} ${res.middleName ? res.middleName.charAt(0) + '. ' : ''}${res.lastName}`.toUpperCase()
  }

  const captainName = formatName(captain?.resident)
  const treasurerName = formatName(treasurer?.resident)
  const secretaryName = formatName(secretary?.resident)
  const skChairName = formatName(skChair?.resident)

  let renderedTemplate = template.contentHtml
  renderedTemplate = renderedTemplate.replace(/{{fullName}}/g, fullName.toUpperCase())
  renderedTemplate = renderedTemplate.replace(/{{address}}/g, fullAddress)
  renderedTemplate = renderedTemplate.replace(/{{purpose}}/g, (purpose || '').toUpperCase())
  renderedTemplate = renderedTemplate.replace(/{{age}}/g, age.toString())
  renderedTemplate = renderedTemplate.replace(/{{civilStatus}}/g, resident.civilStatus || '')
  renderedTemplate = renderedTemplate.replace(/{{businessName}}/g, (businessName || '').toUpperCase())
  renderedTemplate = renderedTemplate.replace(/{{businessAddress}}/g, (businessAddress || '').toUpperCase())

  return (
    <Box id="print-ready" sx={{ p: 4, maxWidth: '850px', margin: '0 auto', bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      
      {/* Watermark Background */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.1,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '500px',
        height: '500px',
      }}>
        {settings.watermarkUrl ? (
          <img src={settings.watermarkUrl} alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            border: '5px solid #000',
            borderRadius: '50%',
          }}>
            <Typography variant="h1" sx={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
              TALISAY CITY<br/>SEAL
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ '@media print': { display: 'none' }, mb: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={handlePrint}>Print Document</Button>
          <Button sx={{ ml: 2 }} variant="outlined" onClick={() => router.push('/documents')}>Back</Button>
        </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, pb: 2, gap: 5 }}>
        {/* Left Logo */}
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: settings.logoUrl ? 'none' : '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <Typography variant="caption">BRGY LOGO</Typography>
          )}
        </Box>
        
        {/* Center Text */}
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Typography variant="body1">Republic of the Philippines</Typography>
          <Typography variant="body1">Province of {settings.province}</Typography>
          <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>{settings.cityMunicipality}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase', mt: 1 }}>{settings.barangayName} HALL</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>OFFICE OF THE BARANGAY CAPTAIN</Typography>
        </Box>

        {/* Right Logo */}
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', border: settings.cityLogoUrl ? 'none' : '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {settings.cityLogoUrl ? (
            <img src={settings.cityLogoUrl} alt="City Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <Typography variant="caption">CITY LOGO</Typography>
          )}
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
            <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. {captainName}</Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>Punong Barangay</Typography>
          </Box>

          <Typography sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2, fontSize: '0.9rem' }}>
            SANGGUNIANG BARANGAY<br/>MEMBERS
          </Typography>

          <Box sx={{ textAlign: 'center', mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {kagawads.length > 0 ? (
              kagawads.map((k, i) => (
                <Typography key={i} variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  HON. {formatName(k.resident)}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'gray' }}>No Kagawads found</Typography>
            )}
            {skChair && (
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1, fontSize: '0.85rem' }}>
                HON. {skChairName}
              </Typography>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography sx={{ textDecoration: 'underline' }}>Barangay Treasurer</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '0.85rem' }}>{treasurerName}</Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ textDecoration: 'underline' }}>Barangay Secretary</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '0.85rem' }}>{secretaryName}</Typography>
          </Box>
        </Box>

        {/* Right Column - Document Body */}
        <Box sx={{ width: '70%', pl: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ mb: 4 }}>TO WHOM IT MAY CONCERN:</Typography>
          
          <div dangerouslySetInnerHTML={{ __html: renderedTemplate }} />

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
                  <Typography variant="caption" sx={{ borderBottom: '1px solid black', flex: 1 }}>
                    BRGY. {resident.household?.barangay?.toUpperCase() || '__________'}, TALISAY CITY
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Not valid without official seal.</Typography>
            </Box>

            <Box sx={{ textAlign: 'center', pb: 4 }}>
              <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>HON. {captainName}</Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>Barangay Captain</Typography>
            </Box>
          </Box>

        </Box>
      </Box>
      </Box>

      {/* Watermark / Copyright */}
      <Typography sx={{ textAlign: 'center', mt: 4, fontSize: '6pt', color: 'gray' }}>
        Visits E-barangay Portal ©2026 - Alben Gacayan. All rights reserved
      </Typography>
    </Box>
  )
}

DocumentPrintView.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
DocumentPrintView.authGuard = false
