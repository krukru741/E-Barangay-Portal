import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Alert from '@mui/material/Alert'

export default function DocumentRequestForm() {
  const router = useRouter()
  const [residents, setResidents] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    type: 'CLEARANCE',
    purpose: '',
    residentId: '',
    remarks: ''
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/residents')
      .then(res => res.json())
      .then(data => setResidents(data))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error submitting request')
      }

      router.push('/documents')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const selectedResident = residents.find(r => r.id === formData.residentId)
  const showIndigencyWarning = formData.type === 'INDIGENCY' && selectedResident && !selectedResident.isIndigent

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant='h5'>Request New Document</Typography>
        <Link href='/documents' passHref>
          <Button variant='outlined'>Back to List</Button>
        </Link>
      </Box>

      <Card>
        <CardContent>
          {error && <Typography color='error' sx={{ mb: 4 }}>{error}</Typography>}
          
          {showIndigencyWarning && (
            <Alert severity='warning' sx={{ mb: 4 }}>
              Note: This resident is not tagged as "Indigent" in their profile. Are you sure you want to issue a Certificate of Indigency?
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Resident</InputLabel>
                  <Select
                    label='Select Resident'
                    name='residentId'
                    value={formData.residentId}
                    onChange={handleChange}
                    required
                  >
                    {residents.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.firstName} {r.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    label='Document Type'
                    name='type'
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value='CLEARANCE'>Barangay Clearance</MenuItem>
                    <MenuItem value='RESIDENCY'>Certificate of Residency</MenuItem>
                    <MenuItem value='INDIGENCY'>Certificate of Indigency</MenuItem>
                    <MenuItem value='BUSINESS'>Business Clearance</MenuItem>
                    <MenuItem value='GOOD_MORAL'>Good Moral Character</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Purpose'
                  name='purpose'
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Remarks (Optional)'
                  name='remarks'
                  value={formData.remarks}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained' size='large' disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
