import { useState, useEffect } from 'react'
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
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Webcam from 'react-webcam'
import { useRef, useCallback } from 'react'
import { resizeImageFile, resizeBase64 } from 'src/utils/image'

export default function EditResident() {
  const router = useRouter()
  const { id } = router.query

  const [initialLoading, setInitialLoading] = useState(true)
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
    sitio: '',
    purok: '',
    purok: '',
    barangay: 'Barangay Poblacion',
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

  // Fetch households for dropdown
  useEffect(() => {
    fetch('/api/households')
      .then(res => res.json())
      .then(data => setHouseholds(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (id) {
      fetch(`/api/residents/${id}`)
        .then(res => res.json())
        .then(data => {
          // Format date for the input
          const formattedDate = new Date(data.birthDate).toISOString().split('T')[0]
          
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            middleName: data.middleName || '',
            suffix: data.suffix || '',
            birthDate: formattedDate,
            gender: data.gender || 'MALE',
            civilStatus: data.civilStatus || 'SINGLE',
            contactNumber: data.contactNumber || '',
            email: data.email || '',
            householdId: data.householdId || '',
            houseNumber: data.household?.houseNumber || '',
            street: data.household?.street || '',
            sitio: data.household?.sitio || '',
            purok: data.household?.purok || '',
            barangay: data.household?.barangay || 'Barangay Poblacion',
            isHeadOfFamily: data.isHeadOfFamily || false,
            isIndigent: data.isIndigent || false,
            isSenior: data.isSenior || false,
            isPWD: data.isPWD || false,
            isVoter: data.isVoter || false,
            isSoloParent: data.isSoloParent || false,
            is4PsBeneficiary: data.is4PsBeneficiary || false,
            occupation: data.occupation || '',
            educationalAttainment: data.educationalAttainment || '',
            incomeBracket: data.incomeBracket || '',
            photo: data.photo || ''
          })

          if (data.householdId) {
            // Find in loaded households or wait until they load? We can just set a dummy object for the display
            setSelectedHousehold({
              id: data.householdId,
              houseNumber: data.household?.houseNumber,
              street: data.household?.street,
              sitio: data.household?.sitio,
              purok: data.household?.purok,
              barangay: data.household?.barangay,
              // Ideally we fetch the head from households list, but this works as fallback
              residents: data.household?.residents || []
            })
          }

          setInitialLoading(false)
        })
        .catch(err => {
          console.error(err)
          setInitialLoading(false)
        })
    }
  }, [id])

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
      setFormData(prev => ({
        ...prev,
        householdId: newValue.id,
        houseNumber: newValue.houseNumber || '',
        street: newValue.street || '',
        sitio: newValue.sitio || '',
        purok: newValue.purok || '',
        barangay: newValue.barangay || 'Barangay Poblacion',
        isHeadOfFamily: false
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        householdId: '',
        isHeadOfFamily: false
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = { ...formData }
    if (!payload.householdId) delete (payload as any).householdId
    if (!payload.occupation) delete (payload as any).occupation
    if (!payload.educationalAttainment) delete (payload as any).educationalAttainment
    if (!payload.incomeBracket) delete (payload as any).incomeBracket

    try {
      const res = await fetch(`/api/residents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        router.push(`/residents/${id}`)
      } else {
        const errorData = await res.json()
        alert(errorData.message || 'Error updating resident')
      }
    } catch (error) {
      console.error(error)
      alert('Error updating resident')
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

  if (initialLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant='h5'>
          Update Resident Info
        </Typography>
        <Link href={`/residents/${id}`} passHref>
          <Button variant='outlined'>Cancel</Button>
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
                    const head = option.residents?.find((r: any) => r.isHeadOfFamily)
                    const headName = head ? `${head.firstName} ${head.lastName}` : 'No Head Assigned'
                    const address = [option.houseNumber, option.street, option.sitio, option.barangay].filter(Boolean).join(' ')
                    return `Household of ${headName} (${address})`
                  }}
                  value={selectedHousehold}
                  onChange={handleHouseholdChange}
                  renderInput={(params) => <TextField {...params} label='Assign to Existing Household' />}
                />
                <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                  If you choose a household above, this resident will join it. Leave blank to create or update their own household.
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField fullWidth label='House Number' name='houseNumber' value={formData.houseNumber} onChange={handleChange} disabled={isAddressDisabled} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth label='Street Name' name='street' value={formData.street} onChange={handleChange} required disabled={isAddressDisabled} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Sitio (Optional)' name='sitio' value={formData.sitio} onChange={handleChange} disabled={isAddressDisabled} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label='Purok (Optional)' name='purok' value={formData.purok} onChange={handleChange} disabled={isAddressDisabled} />
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
                  {loading ? 'Saving Changes...' : 'Save Changes'}
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
