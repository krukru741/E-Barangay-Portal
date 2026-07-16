import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'

const statusColorMap: any = {
  OPEN: 'warning',
  MEDIATION: 'info',
  RESOLVED: 'success',
  ESCALATED: 'error',
  CLOSED: 'default'
}

const BlotterDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [blotter, setBlotter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Status Update State
  const [status, setStatus] = useState('')

  // Hearing State
  const [hearingDate, setHearingDate] = useState('')
  const [hearingOutcome, setHearingOutcome] = useState('')

  const fetchBlotter = () => {
    if (!id) return
    fetch(`/api/blotters/${id}`)
      .then(res => res.json())
      .then(data => {
        setBlotter(data)
        setStatus(data.status)
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchBlotter()
  }, [id])

  const handleUpdateStatus = async () => {
    await fetch(`/api/blotters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchBlotter()
  }

  const handleAddHearing = async (e: any) => {
    e.preventDefault()
    await fetch(`/api/blotters/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt: hearingDate, outcome: hearingOutcome })
    })
    setHearingDate('')
    setHearingOutcome('')
    fetchBlotter()
  }

  if (loading) return <Typography>Loading case details...</Typography>
  if (!blotter) return <Typography color="error">Case not found</Typography>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader 
            title={`Blotter Case: ${blotter.blotterNumber}`}
            action={<Chip label={blotter.status} color={statusColorMap[blotter.status]} />}
          />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Incident Type</Typography>
                <Typography>{blotter.incidentType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Date Filed</Typography>
                <Typography>{new Date(blotter.filedAt).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Incident Date & Time</Typography>
                <Typography>{new Date(blotter.incidentDate).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                <Typography>{blotter.location}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Complainant</Typography>
                <Typography variant="h6">{blotter.complainant.firstName} {blotter.complainant.lastName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">Respondent</Typography>
                <Typography variant="h6">{blotter.respondent.firstName} {blotter.respondent.lastName}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>Narrative / Case Details</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{blotter.narrative}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Hearings Section */}
        <Card sx={{ mt: 6 }}>
          <CardHeader title="Hearings & Mediation" />
          <CardContent>
            {blotter.hearings?.map((h: any, i: number) => (
              <Box key={h.id} sx={{ mb: 4, p: 4, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2">Hearing {blotter.hearings.length - i}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(h.scheduledAt).toLocaleString()}</Typography>
                <Typography variant="body2"><strong>Outcome:</strong> {h.outcome || 'Pending'}</Typography>
              </Box>
            ))}

            <form onSubmit={handleAddHearing} style={{ marginTop: '20px' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Schedule New Hearing</Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="datetime-local" label="Schedule" value={hearingDate} onChange={(e) => setHearingDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Outcome Notes" value={hearingOutcome} onChange={(e) => setHearingOutcome(e.target.value)} placeholder="Result of the hearing..." />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="outlined">Add Hearing Record</Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Sidebar Controls */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Case Actions" />
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Update Status</Typography>
            <TextField select fullWidth value={status} onChange={(e) => setStatus(e.target.value)} sx={{ mb: 4 }}>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="MEDIATION">Mediation</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
              <MenuItem value="ESCALATED">Escalated (MTC)</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </TextField>
            <Button fullWidth variant="contained" onClick={handleUpdateStatus}>
              Save Status
            </Button>
            
            <Button fullWidth variant="outlined" sx={{ mt: 4 }} onClick={() => window.print()}>
              Print Case Record
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BlotterDetailsPage
