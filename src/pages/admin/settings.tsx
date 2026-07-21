import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import CircularProgress from '@mui/material/CircularProgress'
import CityVariantOutline from 'mdi-material-ui/CityVariantOutline'
import CloudUploadOutline from 'mdi-material-ui/CloudUploadOutline'
import ContentSaveOutline from 'mdi-material-ui/ContentSaveOutline'

const AdminSettingsPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState({
    barangayName: '',
    cityMunicipality: '',
    province: '',
    contactNumber: '',
    email: '',
    logoUrl: '',
    cityLogoUrl: '',
    watermarkUrl: ''
  })

  const role = (session?.user as any)?.role

  useEffect(() => {
    if (session && !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      router.replace('/')
      return
    }
    if (session) {
      fetch('/api/admin/settings')
        .then(r => r.json())
        .then(d => {
          setSettings({
            barangayName: d.barangayName || '',
            cityMunicipality: d.cityMunicipality || '',
            province: d.province || '',
            contactNumber: d.contactNumber || '',
            email: d.email || '',
            logoUrl: d.logoUrl || '',
            cityLogoUrl: d.cityLogoUrl || '',
            watermarkUrl: d.watermarkUrl || ''
          })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session, role, router])

  const [error, setError] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 600
          let width = img.width
          let height = img.height

          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width)
            width = MAX_SIZE
          } else if (height > width && height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height)
            height = MAX_SIZE
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Compress to JPEG with 80% quality (reduces size from MBs to KBs)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          setSettings(prev => ({ ...prev, [field]: dataUrl }))
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to save settings')
        console.error('Save failed:', errorData)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Network error occurred')
    }
    setSaving(false)
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>System Settings</Typography>
            <Typography variant='body2' color='textSecondary'>Manage your barangay profile and portal configuration</Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <ContentSaveOutline />}
            onClick={handleSave}
            disabled={saving}
            sx={{ boxShadow: '0 4px 12px 0 rgba(102,108,255,0.4)' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Grid>

      {success && (
        <Grid item xs={12}>
          <Alert severity='success'>Settings saved successfully! Changes will reflect on the portal.</Alert>
        </Grid>
      )}

      {error && (
        <Grid item xs={12}>
          <Alert severity='error'>{error}</Alert>
        </Grid>
      )}

      {/* Logo & Name Preview */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
          <CardHeader title='Barangay Profile Preview' titleTypographyProps={{ sx: { fontWeight: 600 } }} />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 0 }}>
            <Avatar
              src={settings.logoUrl}
              sx={{ width: 120, height: 120, border: '3px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <CityVariantOutline sx={{ fontSize: 60 }} />
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>{settings.barangayName || 'Barangay Name'}</Typography>
              <Typography variant='body2' color='textSecondary'>{settings.cityMunicipality}, {settings.province}</Typography>
              {settings.contactNumber && <Typography variant='body2' color='textSecondary'>📞 {settings.contactNumber}</Typography>}
              {settings.email && <Typography variant='body2' color='textSecondary'>✉️ {settings.email}</Typography>}
            </Box>
            <Divider sx={{ width: '100%' }} />
            
            {/* Hidden file input for uploads */}
            <input
              type="file"
              accept="image/*"
              id="upload-brgy-logo"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'logoUrl')}
            />
            <input
              type="file"
              accept="image/*"
              id="upload-city-logo"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'cityLogoUrl')}
            />
            <input
              type="file"
              accept="image/*"
              id="upload-watermark"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'watermarkUrl')}
            />

            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <TextField
                fullWidth
                label='Barangay Logo URL'
                size='small'
                value={settings.logoUrl}
                onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                helperText='Paste URL or upload image'
              />
              <Button component="label" htmlFor="upload-brgy-logo" variant="outlined" sx={{ minWidth: 40, p: 2 }}>
                <CloudUploadOutline />
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <TextField
                fullWidth
                label='City Logo URL'
                size='small'
                value={settings.cityLogoUrl}
                onChange={e => setSettings({ ...settings, cityLogoUrl: e.target.value })}
                helperText='Paste URL or upload image'
              />
              <Button component="label" htmlFor="upload-city-logo" variant="outlined" sx={{ minWidth: 40, p: 2 }}>
                <CloudUploadOutline />
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <TextField
                fullWidth
                label='Watermark/Seal URL'
                size='small'
                value={settings.watermarkUrl}
                onChange={e => setSettings({ ...settings, watermarkUrl: e.target.value })}
                helperText='Paste URL or upload image'
              />
              <Button component="label" htmlFor="upload-watermark" variant="outlined" sx={{ minWidth: 40, p: 2 }}>
                <CloudUploadOutline />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Settings Form */}
      <Grid item xs={12} md={8}>
        <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
          <CardHeader title='Barangay Information' titleTypographyProps={{ sx: { fontWeight: 600 } }} />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label='Barangay Name'
                  value={settings.barangayName}
                  onChange={e => setSettings({ ...settings, barangayName: e.target.value })}
                  helperText='Official name of the barangay (e.g., Barangay San Jose)'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label='City / Municipality'
                  value={settings.cityMunicipality}
                  onChange={e => setSettings({ ...settings, cityMunicipality: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label='Province'
                  value={settings.province}
                  onChange={e => setSettings({ ...settings, province: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Contact Number'
                  value={settings.contactNumber}
                  onChange={e => setSettings({ ...settings, contactNumber: e.target.value })}
                  placeholder='e.g., 032-123-4567'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Official Email'
                  type='email'
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  placeholder='e.g., barangay@gov.ph'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminSettingsPage
