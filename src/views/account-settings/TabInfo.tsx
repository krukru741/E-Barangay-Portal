import { useState, useEffect, forwardRef } from 'react'
import { useSession } from 'next-auth/react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import AccountGroupOutline from 'mdi-material-ui/AccountGroupOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import CardAccountDetailsOutline from 'mdi-material-ui/CardAccountDetailsOutline'

const TabInfo = () => {
  const { data: session } = useSession()
  const [resident, setResident] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as any)?.id

  useEffect(() => {
    if (!userId) return
    // Try to find the resident record linked to this user account
    fetch(`/api/residents?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        // data might be an array - find the one linked to this user
        if (Array.isArray(data)) {
          const linked = data.find((r: any) => r.userId === userId)
          setResident(linked || null)
        } else if (data && !data.error) {
          setResident(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatAddress = (household: any) => {
    if (!household) return '—'
    const parts = []
    if (household.houseNumber && household.houseNumber !== 'N/A') parts.push(`House No. ${household.houseNumber}`)
    if (household.street && household.street !== 'N/A') parts.push(household.street)
    if (household.purok && household.purok !== 'N/A') parts.push(`Purok ${household.purok}`)
    if (household.sitio && household.sitio !== 'N/A') parts.push(`Sitio ${household.sitio}`)
    if (household.barangay) parts.push(household.barangay)
    if (household.city) parts.push(household.city)
    return parts.join(', ') || '—'
  }

  if (loading) return (
    <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
      <CircularProgress />
    </CardContent>
  )

  if (!resident) {
    return (
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <AccountGroupOutline sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>No Resident Profile Linked</Typography>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Your account is not yet linked to a Resident profile. Please contact the Barangay Admin to have your resident record registered and linked to this account.
          </Typography>
          <Alert severity='info' sx={{ maxWidth: 400, mx: 'auto', textAlign: 'left' }}>
            <strong>Note:</strong> Only registered residents with a linked account can view their resident information here.
          </Alert>
        </Box>
      </CardContent>
    )
  }

  const infoRows = [
    { label: 'Full Name', value: `${resident.firstName} ${resident.middleName || ''} ${resident.lastName}`.trim() },
    { label: 'Date of Birth', value: formatDate(resident.birthDate) },
    { label: 'Age', value: resident.birthDate ? `${new Date().getFullYear() - new Date(resident.birthDate).getFullYear()} years old` : '—' },
    { label: 'Gender', value: resident.gender },
    { label: 'Civil Status', value: resident.civilStatus },
    { label: 'Nationality', value: resident.nationality || 'Filipino' },
    { label: 'Occupation', value: resident.occupation || '—' },
    { label: 'Contact Number', value: resident.contactNumber || '—' },
    { label: 'Email Address', value: resident.email || '—' },
  ]

  const classificationTags = [
    resident.isIndigent && 'Indigent',
    resident.isSeniorCitizen && 'Senior Citizen',
    resident.isPWD && 'PWD',
    resident.isVoter && 'Registered Voter',
    resident.is4Ps && '4Ps Beneficiary',
  ].filter(Boolean)

  return (
    <CardContent>
      {/* Resident ID Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 3, borderRadius: 2, backgroundColor: 'rgba(102,108,255,0.04)', border: '1px solid rgba(102,108,255,0.1)' }}>
        <CardAccountDetailsOutline sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant='caption' color='textSecondary' sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Resident ID</Typography>
          <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: 1 }}>{resident.residentId || resident.id.substring(0, 8).toUpperCase()}</Typography>
        </Box>
      </Box>

      {/* Personal Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AccountGroupOutline sx={{ color: 'text.secondary' }} />
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Personal Information</Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {infoRows.map(row => (
          <Grid item xs={12} sm={6} key={row.label}>
            <Box>
              <Typography variant='caption' color='textSecondary' sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{row.label}</Typography>
              <Typography variant='body1' sx={{ fontWeight: 500, mt: 0.3 }}>{row.value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Address */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HomeOutline sx={{ color: 'text.secondary' }} />
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Address</Typography>
      </Box>

      <Box sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', mb: 4 }}>
        <Typography variant='body1'>{formatAddress(resident.household)}</Typography>
      </Box>

      {/* Classification Tags */}
      {classificationTags.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>Special Classifications</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {classificationTags.map((tag: any) => (
              <Chip key={tag} label={tag} color='primary' variant='outlined' size='small' sx={{ fontWeight: 600 }} />
            ))}
          </Box>
        </>
      )}

      <Alert severity='info' sx={{ mt: 4 }}>
        To update your resident information (address, civil status, etc.), please visit the Barangay Hall or contact the Admin.
      </Alert>
    </CardContent>
  )
}

export default TabInfo
