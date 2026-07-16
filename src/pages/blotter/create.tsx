import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

const FileBlotterPage = () => {
  const router = useRouter()
  const [residents, setResidents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    blotterNumber: `BLOTTER-${new Date().getTime()}`,
    incidentType: '',
    incidentDate: '',
    location: '',
    narrative: '',
    complainantId: '',
    respondentId: ''
  })

  useEffect(() => {
    fetch('/api/residents')
      .then(res => res.json())
      .then(data => setResidents(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load residents'))
  }, [])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/blotters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to file blotter')
      }
      router.push('/blotter')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>File New Blotter</Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title='Incident Details' />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                {error && (
                  <Grid item xs={12}>
                    <Typography color="error">{error}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label='Blotter Number (Auto-Generated)' 
                    name="blotterNumber" 
                    value={formData.blotterNumber} 
                    onChange={handleChange} 
                    InputProps={{ readOnly: true }}
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Incident Type' name="incidentType" value={formData.incidentType} onChange={handleChange} placeholder="e.g. Theft, Assault, Disturbance" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Incident Date & Time' name="incidentDate" type="datetime-local" value={formData.incidentDate} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Location' name="location" value={formData.location} onChange={handleChange} required />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Complainant</InputLabel>
                    <Select label='Complainant' name="complainantId" value={formData.complainantId} onChange={handleChange} required>
                      {residents.map((r) => (
                        <MenuItem key={r.id} value={r.id}>{r.firstName} {r.lastName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Respondent (Suspect/Accused)</InputLabel>
                    <Select label='Respondent' name="respondentId" value={formData.respondentId} onChange={handleChange} required>
                      {residents.map((r) => (
                        <MenuItem key={r.id} value={r.id}>{r.firstName} {r.lastName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={4} label='Incident Narrative' name="narrative" value={formData.narrative} onChange={handleChange} placeholder="Describe what happened in detail..." required />
                </Grid>

                <Grid item xs={12}>
                  <Button type='submit' variant='contained' size='large'>
                    File Blotter Report
                  </Button>
                  <Button variant='outlined' size='large' sx={{ ml: 2 }} onClick={() => router.push('/blotter')}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default FileBlotterPage
