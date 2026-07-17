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
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'

export default function DocumentRequestForm() {
  const router = useRouter()
  const [residents, setResidents] = useState<any[]>([])
  
  const [formData, setFormData] = useState<any>({
    type: 'CLEARANCE',
    purpose: '',
    residentId: '',
    remarks: '',
    cedulaNumber: '',
    cedulaIssuedAt: '',
    feeAmount: 50,
    orNumber: '',
    businessName: '',
    businessAddress: '',
    urgency: 'REGULAR',
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
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: name === 'feeAmount' ? Number(value) : value }))
  }

  const selectedResident = residents.find(r => r.id === formData.residentId)
  const showIndigencyWarning = formData.type === 'INDIGENCY' && selectedResident && !selectedResident.isIndigent

  useEffect(() => {
    // Dynamic price indicator logic
    let fee = 50
    if (formData.type === 'INDIGENCY' && selectedResident?.isIndigent) {
      fee = 0
    } else if (formData.type === 'BUSINESS') {
      fee = 100
    }
    setFormData((prev: any) => ({ ...prev, feeAmount: fee }))
  }, [formData.type, selectedResident])

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
                {selectedResident && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>Status:</Typography>
                    {selectedResident.isIndigent && <Chip size="small" label="Indigent" color="error" />}
                    {selectedResident.isSenior && <Chip size="small" label="Senior Citizen" color="primary" />}
                    {selectedResident.isPWD && <Chip size="small" label="PWD" color="warning" />}
                    {selectedResident.isSoloParent && <Chip size="small" label="Solo Parent" color="secondary" />}
                    {selectedResident.isVoter && <Chip size="small" label="Registered Voter" color="success" />}
                    {!selectedResident.isIndigent && !selectedResident.isSenior && !selectedResident.isPWD && !selectedResident.isSoloParent && !selectedResident.isVoter && (
                      <Typography variant="body2" color="textSecondary">Regular Resident</Typography>
                    )}
                  </Box>
                )}
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
                    <MenuItem value='ENDORSEMENT'>Endorsement Letter</MenuItem>
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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Urgency / Priority Level</InputLabel>
                  <Select
                    label='Urgency / Priority Level'
                    name='urgency'
                    value={formData.urgency}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value='REGULAR'>Regular</MenuItem>
                    <MenuItem value='PRIORITY'>Priority / Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Additional Details</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Cedula (CTC) Number'
                  name='cedulaNumber'
                  value={formData.cedulaNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label='Cedula Issued Date'
                  name='cedulaIssuedAt'
                  value={formData.cedulaIssuedAt}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label='Fee Amount'
                  name='feeAmount'
                  value={formData.feeAmount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  helperText={`Estimated Fee: ₱${formData.feeAmount}.00`}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='O.R. Number (Receipt)'
                  name='orNumber'
                  value={formData.orNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </Grid>

              {formData.type === 'BUSINESS' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Business Information</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Business Name'
                      name='businessName'
                      value={formData.businessName}
                      onChange={handleChange}
                      required={formData.type === 'BUSINESS'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Business Address'
                      name='businessAddress'
                      value={formData.businessAddress}
                      onChange={handleChange}
                      required={formData.type === 'BUSINESS'}
                    />
                  </Grid>
                </>
              )}

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
