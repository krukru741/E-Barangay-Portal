import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { usePhilAddress, toTitleCase } from 'src/hooks/usePhilAddress'

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
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Autocomplete from '@mui/material/Autocomplete'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Webcam from 'react-webcam'
import { useRef, useCallback } from 'react'
import { resizeImageFile, resizeBase64 } from 'src/utils/image'
export default function CreateResident() {
  const {
    provinces,
    cities,
    barangays,
    selectedProvCode,
    selectedMunCode,
    handleProvinceChange,
    handleCityChange,
    getProvCodeByName,
    getMunCodeByName,
  } = usePhilAddress('0722', '') // 0722 = Cebu default

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [households, setHouseholds] = useState<any[]>([])
  const [selectedHousehold, setSelectedHousehold] = useState<any | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    birthDate: '',
    gender: 'MALE',
    civilStatus: 'SINGLE',
    contactNumber: '',
    email: '',
    householdId: '',
    houseNumber: '',
    street: '',
    village: '',
    sitio: '',
    purok: '',
    barangay: 'Poblacion',
    city: 'Talisay City',
    province: 'Cebu',
    postalCode: '',
    country: 'Philippines',
    isHeadOfFamily: false,
    isIndigent: false,
    isSenior: false,
    isPWD: false,
    isVoter: false,
    isSoloParent: false,
    is4PsBeneficiary: false,
    occupation: '',
    educationalAttainment: '',
    incomeBracket: '',
    photo: ''
  })

  useEffect(() => {
    fetch('/api/households')
      .then(res => res.json())
      .then(data => setHouseholds(data))
      .catch(console.error)
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleHouseholdChange = (event: any, newValue: any | null) => {
    setSelectedHousehold(newValue)
    if (newValue) {
      const provCode = getProvCodeByName(newValue.province || 'Cebu')
      handleProvinceChange(provCode)
      // Need a tick for cities to load before setting mun code
      setTimeout(() => {
        handleCityChange(getMunCodeByName(newValue.city || 'Talisay City', provCode))
      }, 0)
      setFormData(prev => ({
        ...prev,
        householdId: newValue.id,
        houseNumber: newValue.houseNumber || '',
        street: newValue.street || '',
        village: newValue.village || '',
        sitio: newValue.sitio || '',
        purok: newValue.purok || '',
        barangay: newValue.barangay || 'Poblacion',
        city: newValue.city || 'Talisay City',
        province: newValue.province || 'Cebu',
        postalCode: newValue.postalCode || '',
        country: newValue.country || 'Philippines',
        isHeadOfFamily: false
      }))
    } else {
      handleProvinceChange(getProvCodeByName('Cebu'))
      handleCityChange('')
      setFormData(prev => ({
        ...prev,
        householdId: '',
        houseNumber: '',
        street: '',
        village: '',
        sitio: '',
        purok: '',
        barangay: 'Poblacion',
        city: 'Talisay City',
        province: 'Cebu',
        postalCode: '',
        country: 'Philippines',
        isHeadOfFamily: false
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Send only necessary fields
    const payload = { ...formData }
    if (!payload.householdId) delete (payload as any).householdId
    if (!payload.occupation) delete (payload as any).occupation
    if (!payload.educationalAttainment) delete (payload as any).educationalAttainment
    if (!payload.incomeBracket) delete (payload as any).incomeBracket

    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        router.push('/residents')
      } else {
        const err = await res.json()
        alert(err.message || 'Error creating resident')
      }
    } catch (error) {
      console.error(error)
      alert('Error creating resident')
    } finally {
      setLoading(false)
    }
  }

  const isAddressDisabled = !!selectedHousehold

  const handleCapture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        try {
          const resized = await resizeBase64(imageSrc)
          setFormData(prev => ({ ...prev, photo: resized }))
          setCameraOpen(false)
        } catch (e) {
          console.error("Error resizing image", e)
        }
      }
    }
  }, [webcamRef])

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const resized = await resizeImageFile(file)
        setFormData(prev => ({ ...prev, photo: resized }))
      } catch (err) {
        console.error("Error uploading image", err)
      }
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
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {formData.photo ? (
                      <img src={formData.photo} alt="Resident" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Typography variant="caption" color="textSecondary">No Photo</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" component="label" size="small">
                      Upload Photo
                      <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => setCameraOpen(true)}>
                      Take Photo
                    </Button>
                  </Box>
                </Box>
              </Grid>

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
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type='email' label='Email Address' name='email' value={formData.email} onChange={handleChange} />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Household Mapping</Divider>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  options={households}
                  getOptionLabel={(option) => {
                    // Get head of family (from the API filtered residents)
                    const head = option.residents?.find((r: any) => r.isHeadOfFamily)
                      || option.residents?.[0] // fallback to first resident
                    const headName = head
                      ? `${head.firstName} ${head.lastName}`.trim()
                      : 'No Head Assigned'

                    // Build address string — include houseNumber, street, barangay
                    const addrParts = [
                      option.houseNumber ? `No. ${option.houseNumber}` : null,
                      option.street || null,
                      option.village || null,
                      option.barangay ? `Brgy. ${option.barangay}` : null,
                    ].filter(Boolean).join(', ')

                    // Show resident count for extra context
                    const count = option._count?.residents ?? option.residents?.length ?? 0
                    const countLabel = count === 1 ? '1 member' : `${count} members`

                    // Short unique ID as disambiguator
                    const shortId = option.id?.slice(-5).toUpperCase() || ''

                    return `[${shortId}] ${headName} — ${addrParts} (${countLabel})`
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={selectedHousehold}
                  onChange={handleHouseholdChange}
                  renderInput={(params) => <TextField {...params} label='Assign to Existing Household (Search by Head of Family or Address)' />}
                />
                <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                  Leave this blank if you are creating a NEW household.
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='House Number' name='houseNumber' placeholder='e.g. 123' value={formData.houseNumber} onChange={handleChange} disabled={isAddressDisabled} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='Street Name' name='street' value={formData.street} onChange={handleChange} required disabled={isAddressDisabled} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='Village / Subdivision / Phase' name='village' value={formData.village} onChange={handleChange} disabled={isAddressDisabled} inputProps={{ sx: { textTransform: 'capitalize' } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='Sitio (Optional)' name='sitio' value={formData.sitio} onChange={handleChange} disabled={isAddressDisabled} inputProps={{ sx: { textTransform: 'capitalize' } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={isAddressDisabled}>
                  <InputLabel>Purok (Optional)</InputLabel>
                  <Select label='Purok (Optional)' name='purok' value={formData.purok} onChange={handleChange}>
                    <MenuItem value=''><em>None</em></MenuItem>
                    <MenuItem value='1'>Purok 1</MenuItem>
                    <MenuItem value='2'>Purok 2</MenuItem>
                    <MenuItem value='3'>Purok 3</MenuItem>
                    <MenuItem value='4'>Purok 4</MenuItem>
                    <MenuItem value='5'>Purok 5</MenuItem>
                    <MenuItem value='6'>Purok 6</MenuItem>
                    <MenuItem value='7'>Purok 7</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* --- Province Dropdown --- */}
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={provinces}
                  getOptionLabel={(o) => toTitleCase(o.name)}
                  value={provinces.find(p => p.prov_code === selectedProvCode) || null}
                  onChange={(_, v) => {
                    handleProvinceChange(v?.prov_code || '')
                    setFormData(prev => ({ ...prev, province: v ? toTitleCase(v.name) : '', city: '', barangay: '' }))
                  }}
                  disabled={isAddressDisabled}
                  renderInput={(params) => <TextField {...params} label='Province *' />}
                />
              </Grid>
              {/* --- City / Municipality Dropdown --- */}
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={cities}
                  getOptionLabel={(o) => toTitleCase(o.name)}
                  value={cities.find(c => c.mun_code === selectedMunCode) || null}
                  onChange={(_, v) => {
                    handleCityChange(v?.mun_code || '')
                    setFormData(prev => ({ ...prev, city: v ? toTitleCase(v.name) : '', barangay: '' }))
                  }}
                  disabled={isAddressDisabled || !selectedProvCode}
                  renderInput={(params) => <TextField {...params} label='City / Municipality *' />}
                />
              </Grid>
              {/* --- Barangay Dropdown --- */}
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={barangays}
                  getOptionLabel={(o) => o.name}
                  value={barangays.find(b => b.name === formData.barangay) || (formData.barangay ? { name: formData.barangay, mun_code: selectedMunCode } : null)}
                  onChange={(_, v) => setFormData(prev => ({ ...prev, barangay: v?.name || '' }))}
                  disabled={isAddressDisabled || !selectedMunCode}
                  renderInput={(params) => <TextField {...params} label='Barangay *' />}
                />
              </Grid>
              {/* --- Postal Code & Country --- */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Postal Code' name='postalCode' value={formData.postalCode} onChange={handleChange} disabled={isAddressDisabled} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Country' name='country' value={formData.country} onChange={handleChange} required disabled={isAddressDisabled} />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel 
                  control={<Checkbox name='isHeadOfFamily' checked={formData.isHeadOfFamily} onChange={handleChange} />} 
                  label='Set as Head of the Family' 
                  disabled={isAddressDisabled}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Socio-Economic Information</Divider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Occupation</InputLabel>
                  <Select label='Occupation' name='occupation' value={formData.occupation} onChange={handleChange}>
                    <MenuItem value=''><em>None</em></MenuItem>
                    <MenuItem value='UNEMPLOYED'>Unemployed</MenuItem>
                    <MenuItem value='STUDENT'>Student</MenuItem>
                    <MenuItem value='SELF_EMPLOYED'>Self-Employed</MenuItem>
                    <MenuItem value='PRIVATE_EMPLOYEE'>Private Employee</MenuItem>
                    <MenuItem value='GOVERNMENT_EMPLOYEE'>Government Employee</MenuItem>
                    <MenuItem value='OTHERS'>Others</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Educational Attainment</InputLabel>
                  <Select label='Educational Attainment' name='educationalAttainment' value={formData.educationalAttainment} onChange={handleChange}>
                    <MenuItem value=''><em>None</em></MenuItem>
                    <MenuItem value='NONE'>No Formal Education</MenuItem>
                    <MenuItem value='ELEMENTARY'>Elementary Level/Graduate</MenuItem>
                    <MenuItem value='HIGH_SCHOOL'>High School Level/Graduate</MenuItem>
                    <MenuItem value='VOCATIONAL'>Vocational Course</MenuItem>
                    <MenuItem value='COLLEGE_GRADUATE'>College Level/Graduate</MenuItem>
                    <MenuItem value='POST_GRADUATE'>Post-Graduate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Monthly Income Bracket</InputLabel>
                  <Select label='Monthly Income Bracket' name='incomeBracket' value={formData.incomeBracket} onChange={handleChange}>
                    <MenuItem value=''><em>None</em></MenuItem>
                    <MenuItem value='BELOW_10K'>Below ₱10,000</MenuItem>
                    <MenuItem value='FROM_10K_TO_20K'>₱10,000 - ₱20,000</MenuItem>
                    <MenuItem value='FROM_20K_TO_40K'>₱20,000 - ₱40,000</MenuItem>
                    <MenuItem value='ABOVE_40K'>Above ₱40,000</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Special Classifications (Tags)</Divider>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControlLabel control={<Checkbox name='isVoter' checked={formData.isVoter} onChange={handleChange} />} label='Registered Voter' />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControlLabel control={<Checkbox name='isSenior' checked={formData.isSenior} onChange={handleChange} />} label='Senior Citizen' />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControlLabel control={<Checkbox name='isPWD' checked={formData.isPWD} onChange={handleChange} />} label='PWD' />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControlLabel control={<Checkbox name='isIndigent' checked={formData.isIndigent} onChange={handleChange} />} label='Indigent' />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControlLabel control={<Checkbox name='isSoloParent' checked={formData.isSoloParent} onChange={handleChange} />} label='Solo Parent' />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControlLabel control={<Checkbox name='is4PsBeneficiary' checked={formData.is4PsBeneficiary} onChange={handleChange} />} label='4Ps Beneficiary' />
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
      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Take Photo</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          {cameraOpen && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCameraOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCapture} variant="contained" color="primary">Capture</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
