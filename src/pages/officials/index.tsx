import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Autocomplete,
  Avatar,
  Box
} from '@mui/material'
import { useSession } from 'next-auth/react'

export default function OfficialsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(role)

  const [officials, setOfficials] = useState<any[]>([])
  const [residents, setResidents] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form state
  const [residentId, setResidentId] = useState('')
  const [position, setPosition] = useState('KAGAWAD')
  const [committee, setCommittee] = useState('')
  const [termStart, setTermStart] = useState('')
  const [termEnd, setTermEnd] = useState('')
  const [isActive, setIsActive] = useState(true)

  const fetchOfficials = async () => {
    try {
      const res = await fetch('/api/officials')
      const data = await res.json()
      setOfficials(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchResidents = async () => {
    try {
      const res = await fetch('/api/residents')
      const data = await res.json()
      setResidents(Array.isArray(data?.residents) ? data.residents : (Array.isArray(data) ? data : []))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchOfficials()
    fetchResidents()
  }, [])

  const handleOpenAdd = () => {
    setEditId(null)
    setResidentId('')
    setPosition('KAGAWAD')
    setCommittee('')
    setTermStart('')
    setTermEnd('')
    setIsActive(true)
    setOpen(true)
  }

  const handleOpenEdit = (official: any) => {
    setEditId(official.id)
    setResidentId(official.residentId)
    setPosition(official.position)
    setCommittee(official.committee || '')
    setTermStart(new Date(official.termStart).toISOString().split('T')[0])
    setTermEnd(new Date(official.termEnd).toISOString().split('T')[0])
    setIsActive(official.isActive)
    setOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const isEdit = !!editId
      const payload = isEdit 
        ? {
            id: editId,
            position,
            committee,
            termStart: new Date(termStart).toISOString(),
            termEnd: new Date(termEnd).toISOString(),
            isActive
          }
        : {
            residentId,
            position,
            committee,
            termStart: new Date(termStart).toISOString(),
            termEnd: new Date(termEnd).toISOString(),
            isActive: true
          }

      const res = await fetch('/api/officials', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setOpen(false)
        fetchOfficials()
      } else {
        const err = await res.json()
        alert('Error: ' + JSON.stringify(err.error))
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleToggleStatus = async (official: any) => {
    try {
      const payload = {
        id: official.id,
        isActive: !official.isActive
      }
      await fetch('/api/officials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      fetchOfficials()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Barangay Officials</Typography>
        {isAdmin && (
          <Button variant="contained" onClick={handleOpenAdd}>
            Add Official
          </Button>
        )}
      </Grid>

      {officials.map((official) => (
        <Grid item xs={12} md={4} key={official.id}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            <Chip 
              label={official.isActive ? 'Active' : 'Inactive'} 
              color={official.isActive ? 'success' : 'error'} 
              size="small" 
              sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold' }}
            />
            <CardContent sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  variant="rounded" 
                  src={official.resident?.photo} 
                  sx={{ width: 100, height: 100, boxShadow: 1, border: '2px solid #eaeaea' }} 
                />
              </Box>
              <Box sx={{ flex: 1, pt: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5, pr: 7 }}>
                  Hon. {official.resident?.firstName} {official.resident?.lastName}
                </Typography>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {official.position.replace('_', ' ')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                  <strong>Committee:</strong><br/>{official.committee || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                  <strong>Term:</strong><br/>
                  {new Date(official.termStart).toLocaleDateString()} - {new Date(official.termEnd).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📞 {official.resident?.contactNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✉️ barangay.office@gmail.com
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {isAdmin ? (
                    <>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleOpenEdit(official)}
                        sx={{ boxShadow: 0 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color={official.isActive ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(official)}
                      >
                        {official.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="secondary"
                      onClick={() => alert('Message feature coming soon!')}
                      sx={{ boxShadow: 0 }}
                    >
                      Message Official
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Official' : 'Register New Official'}</DialogTitle>
        <DialogContent>
          {!editId ? (
            <Autocomplete
              options={residents}
              getOptionLabel={(option) => option ? `${option.firstName || ''} ${option.lastName || ''}`.trim() : ''}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={option.photo} alt={option.firstName} sx={{ width: 32, height: 32 }} />
                  <Typography>{option.firstName} {option.lastName}</Typography>
                </Box>
              )}
              value={residents.find(r => r.id === residentId) || null}
              onChange={(e, newValue) => setResidentId(newValue ? newValue.id : '')}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search Resident" 
                  margin="normal" 
                  required 
                  helperText="Search and select a resident to register as an official" 
                />
              )}
            />
          ) : (
            <TextField
              fullWidth
              label="Resident"
              margin="normal"
              disabled
              value={(() => {
                const r = residents.find(res => res.id === residentId)
                return r ? `${r.firstName} ${r.lastName}` : 'Loading...'
              })()}
            />
          )}
          <TextField
            select
            required
            fullWidth
            label="Position"
            margin="normal"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            {['CAPTAIN', 'KAGAWAD', 'SECRETARY', 'TREASURER', 'SK_CHAIR', 'SK_KAGAWAD'].map((pos) => (
              <MenuItem key={pos} value={pos}>{pos}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Committee (Optional)"
            margin="normal"
            value={committee}
            onChange={(e) => setCommittee(e.target.value)}
          />
          <TextField
            type="date"
            required
            fullWidth
            label="Term Start"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={termStart}
            onChange={(e) => setTermStart(e.target.value)}
          />
          <TextField
            type="date"
            required
            fullWidth
            label="Term End"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={termEnd}
            onChange={(e) => setTermEnd(e.target.value)}
          />
          {editId && (
            <TextField
              select
              fullWidth
              label="Status"
              margin="normal"
              value={isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(e) => setIsActive(e.target.value === 'ACTIVE')}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
