import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import ContentSaveOutline from 'mdi-material-ui/ContentSaveOutline'
import RestoreOutline from 'mdi-material-ui/RestoreOutline'

const DOC_LABELS: Record<string, string> = {
  CLEARANCE: 'Barangay Clearance',
  RESIDENCY: 'Certificate of Residency',
  INDIGENCY: 'Certificate of Indigency',
  GOOD_MORAL: 'Good Moral Character',
  BUSINESS: 'Business Clearance',
  ENDORSEMENT: 'Endorsement Letter',
}

const DOC_COLORS: Record<string, any> = {
  CLEARANCE: 'primary',
  RESIDENCY: 'success',
  INDIGENCY: 'warning',
  GOOD_MORAL: 'info',
  BUSINESS: 'secondary',
  ENDORSEMENT: 'default',
}

const TemplatesPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<any>(null)
  const [editContent, setEditContent] = useState('')
  const [success, setSuccess] = useState('')

  const role = (session?.user as any)?.role

  useEffect(() => {
    if (session && !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      router.replace('/')
      return
    }
    if (session) fetchTemplates()
  }, [session, role, router])

  const fetchTemplates = async () => {
    const res = await fetch('/api/admin/templates')
    const data = await res.json()
    setTemplates(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleEdit = (template: any) => {
    setCurrentTemplate(template)
    setEditContent(template.contentHtml)
    setEditOpen(true)
  }

  const handleReset = (template: any) => {
    // Reload defaults by not having isSaved
    setEditContent(template.defaultHtml || template.contentHtml)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: currentTemplate.type, contentHtml: editContent })
      })
      if (res.ok) {
        setEditOpen(false)
        fetchTemplates()
        setSuccess(`Template for ${DOC_LABELS[currentTemplate.type]} saved!`)
        setTimeout(() => setSuccess(''), 4000)
      }
    } catch (err) {
      console.error(err)
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
      <Grid item xs={12}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>Document Template Manager</Typography>
          <Typography variant='body2' color='textSecondary'>
            Customize the HTML layout/content for each document certificate
          </Typography>
        </Box>
      </Grid>

      {success && (
        <Grid item xs={12}>
          <Alert severity='success'>{success}</Alert>
        </Grid>
      )}

      {templates.map(template => (
        <Grid item xs={12} md={6} key={template.type}>
          <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader
              title={DOC_LABELS[template.type]}
              titleTypographyProps={{ sx: { fontWeight: 600 } }}
              action={
                <Chip
                  label={template.isSaved ? 'Customized' : 'Default'}
                  color={template.isSaved ? 'primary' : 'default'}
                  size='small'
                />
              }
            />
            <CardContent>
              {/* Template preview */}
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  maxHeight: 150,
                  overflow: 'hidden',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  backgroundColor: '#fafafa',
                  fontFamily: 'monospace',
                  userSelect: 'none',
                  position: 'relative'
                }}
              >
                {template.contentHtml.substring(0, 300)}...
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, #fafafa)' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<PencilOutline />}
                  onClick={() => handleEdit(template)}
                  sx={{ boxShadow: 0 }}
                >
                  Edit Template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          Edit Template: {currentTemplate ? DOC_LABELS[currentTemplate.type] : ''}
        </DialogTitle>
        <DialogContent>
          <Alert severity='info' sx={{ mb: 2 }}>
            Gamiton ang mga placeholder: {'{{residentName}}, {{address}}, {{date}}, {{purpose}}, {{barangayName}}, {{captainName}}, {{age}}, {{civilStatus}}'}
          </Alert>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            style={{
              width: '100%',
              height: 400,
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant='contained'
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <ContentSaveOutline />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TemplatesPage
