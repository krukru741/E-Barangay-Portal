import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

export default function MergeResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sourceResident, setSourceResident] = useState<any | null>(null)
  const [targetResident, setTargetResident] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchResidents = async () => {
    try {
      const res = await fetch('/api/residents')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          // Only show active (unmerged) residents
          setResidents(data.filter((r: any) => !r.isMerged && !r.deletedAt))
        } else {
          console.error('API did not return an array of residents:', data)
          setResidents([])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResidents()
  }, [])

  const handleMerge = async () => {
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    
    try {
      const res = await fetch('/api/admin/merge-residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: sourceResident.id,
          targetId: targetResident.id
        })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Residents successfully merged!' })
        setSourceResident(null)
        setTargetResident(null)
        setConfirmOpen(false)
        fetchResidents() // Refresh the list
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to merge residents' })
        setConfirmOpen(false)
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
      setConfirmOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 5 }}>Merge Duplicate Residents</Typography>
      
      <Card>
        <CardHeader title="Merge Records" titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          <Typography sx={{ mb: 4 }} color="textSecondary">
            Select the duplicate resident record (Source) and the main record you want to keep (Target). 
            All related data (Blotters, Documents) from the Source will be transferred to the Target, and the Source will be archived.
          </Typography>

          {message.text && (
            <Alert severity={message.type as any} sx={{ mb: 4 }}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'error.main', fontWeight: 'bold' }}>
                1. Select Duplicate to Archive (Source)
              </Typography>
              <Autocomplete
                options={Array.isArray(residents) ? residents : []}
                loading={loading}
                getOptionLabel={(option: any) => `${option.firstName} ${option.lastName} (DOB: ${new Date(option.birthDate).toLocaleDateString()})`}
                value={sourceResident}
                onChange={(e, val) => setSourceResident(val)}
                renderInput={(params) => <TextField {...params} label="Search Duplicate Resident" />}
              />
              {sourceResident && (
                <Box sx={{ mt: 2, p: 3, bgcolor: '#fffdf5', border: '1px solid #ffcc00', borderRadius: 1 }}>
                  <Typography variant="body2"><strong>ID:</strong> {sourceResident.id}</Typography>
                  <Typography variant="body2"><strong>Name:</strong> {sourceResident.firstName} {sourceResident.lastName}</Typography>
                  <Typography variant="body2"><strong>DOB:</strong> {new Date(sourceResident.birthDate).toLocaleDateString()}</Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'success.main', fontWeight: 'bold' }}>
                2. Select Main Record to Keep (Target)
              </Typography>
              <Autocomplete
                options={Array.isArray(residents) ? residents : []}
                loading={loading}
                getOptionLabel={(option: any) => `${option.firstName} ${option.lastName} (DOB: ${new Date(option.birthDate).toLocaleDateString()})`}
                value={targetResident}
                onChange={(e, val) => setTargetResident(val)}
                renderInput={(params) => <TextField {...params} label="Search Main Resident" />}
              />
              {targetResident && (
                <Box sx={{ mt: 2, p: 3, bgcolor: '#f0fff0', border: '1px solid #4caf50', borderRadius: 1 }}>
                  <Typography variant="body2"><strong>ID:</strong> {targetResident.id}</Typography>
                  <Typography variant="body2"><strong>Name:</strong> {targetResident.firstName} {targetResident.lastName}</Typography>
                  <Typography variant="body2"><strong>DOB:</strong> {new Date(targetResident.birthDate).toLocaleDateString()}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 6 }} 
            disabled={!sourceResident || !targetResident || sourceResident.id === targetResident.id || submitting}
            onClick={() => setConfirmOpen(true)}
          >
            Review & Merge
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Merge</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to merge these records? This action will transfer all related records from the Source to the Target and soft-delete the Source.
          </Typography>
          {sourceResident && targetResident && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant="caption" color="error">SOURCE (WILL BE ARCHIVED)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{sourceResident.firstName} {sourceResident.lastName}</Typography>
              </Box>
              <Typography variant="h5">→</Typography>
              <Box sx={{ flex: 1, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant="caption" color="success.main">TARGET (WILL BE KEPT)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{targetResident.firstName} {targetResident.lastName}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleMerge} variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Merging...' : 'Confirm Merge'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
