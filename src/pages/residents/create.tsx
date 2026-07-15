import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

export default function CreateResident() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    birthDate: '',
    gender: 'MALE',
    civilStatus: 'SINGLE',
    contactNumber: '',
    email: ''
  })

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/residents')
      } else {
        alert('Error creating resident')
      }
    } catch (error) {
      console.error(error)
      alert('Error creating resident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant='h5'>
          Add New Resident
        </Typography>
        <Link href='/residents' passHref>
          <Button variant='outlined'>Back</Button>
        </Link>
      </Box>

      <Card>
        <CardHeader title='Resident Information' titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='First Name' name='firstName' value={formData.firstName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Last Name' name='lastName' value={formData.lastName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Middle Name' name='middleName' value={formData.middleName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Suffix (e.g. Jr, Sr)' name='suffix' value={formData.suffix} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type='date' label='Birth Date' name='birthDate' InputLabelProps={{ shrink: true }} value={formData.birthDate} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select label='Gender' name='gender' value={formData.gender} onChange={handleChange}>
                    <MenuItem value='MALE'>Male</MenuItem>
                    <MenuItem value='FEMALE'>Female</MenuItem>
                    <MenuItem value='OTHER'>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Civil Status</InputLabel>
                  <Select label='Civil Status' name='civilStatus' value={formData.civilStatus} onChange={handleChange}>
                    <MenuItem value='SINGLE'>Single</MenuItem>
                    <MenuItem value='MARRIED'>Married</MenuItem>
                    <MenuItem value='WIDOWED'>Widowed</MenuItem>
                    <MenuItem value='SEPARATED'>Separated</MenuItem>
                    <MenuItem value='COHABITING'>Cohabiting</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Contact Number' name='contactNumber' value={formData.contactNumber} onChange={handleChange} />
              </Grid>
              
              <Grid item xs={12}>
                <Button type='submit' variant='contained' size='large' disabled={loading}>
                  {loading ? 'Saving...' : 'Save Resident'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
