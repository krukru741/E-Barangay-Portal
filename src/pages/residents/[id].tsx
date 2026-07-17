import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

export default function ResidentProfile() {
  const router = useRouter()
  const { id } = router.query

  const [resident, setResident] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetch(`/api/residents/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch')
          return res.json()
        })
        .then(data => {
          setResident(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
  if (!resident) return <Typography variant="h6" align="center" mt={10}>Resident not found.</Typography>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant='h5'>Resident Profile</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href={`/residents/${id}/edit`} passHref>
            <Button variant='contained'>Update Info</Button>
          </Link>
          <Link href='/residents' passHref>
            <Button variant='outlined'>Back to Registry</Button>
          </Link>
        </Box>
      </Box>

      <Grid container spacing={6}>
        {/* Personal Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Personal Information" />
            <CardContent>
              <Typography variant="body1"><strong>Name:</strong> {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}</Typography>
              <Typography variant="body1"><strong>Birth Date:</strong> {new Date(resident.birthDate).toLocaleDateString()}</Typography>
              <Typography variant="body1"><strong>Gender:</strong> {resident.gender}</Typography>
              <Typography variant="body1"><strong>Civil Status:</strong> {resident.civilStatus}</Typography>
              <Typography variant="body1"><strong>Contact:</strong> {resident.contactNumber || 'N/A'}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {resident.email || 'N/A'}</Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>Special Tags:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {resident.isHeadOfFamily && <Chip label="Head of Family" color="info" />}
                {resident.isSenior && <Chip label="Senior Citizen" color="primary" />}
                {resident.isPWD && <Chip label="PWD" color="secondary" />}
                {resident.isIndigent && <Chip label="Indigent" color="error" />}
                {resident.isVoter && <Chip label="Registered Voter" color="success" />}
                {resident.isSoloParent && <Chip label="Solo Parent" color="warning" />}
                {resident.is4PsBeneficiary && <Chip label="4Ps Beneficiary" color="error" />}
                {!resident.isHeadOfFamily && !resident.isSenior && !resident.isPWD && !resident.isIndigent && !resident.isVoter && !resident.isSoloParent && !resident.is4PsBeneficiary && (
                  <Typography variant="body2" color="textSecondary">No special tags applied.</Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>Socio-Economic Information:</Typography>
              <Typography variant="body1"><strong>Occupation:</strong> {resident.occupation ? resident.occupation.replace(/_/g, ' ') : 'N/A'}</Typography>
              <Typography variant="body1"><strong>Education:</strong> {resident.educationalAttainment ? resident.educationalAttainment.replace(/_/g, ' ') : 'N/A'}</Typography>
              <Typography variant="body1"><strong>Income Bracket:</strong> {resident.incomeBracket ? resident.incomeBracket.replace(/_/g, ' ') : 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Household Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Household & Address" />
            <CardContent>
              {resident.household ? (
                <>
                  {/* --- Address Fields --- */}
                  <Typography variant="body1"><strong>House Number:</strong> {resident.household.houseNumber || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Street:</strong> {resident.household.street || 'N/A'}</Typography>
                  {resident.household.village && (
                    <Typography variant="body1"><strong>Village / Subdivision:</strong> {resident.household.village}</Typography>
                  )}
                  <Typography variant="body1"><strong>Sitio:</strong> {resident.household.sitio || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Purok:</strong> {resident.household.purok ? `Purok ${resident.household.purok}` : 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Barangay:</strong> {resident.household.barangay || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>City / Municipality:</strong> {resident.household.city || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Province:</strong> {resident.household.province || 'N/A'}</Typography>
                  {resident.household.postalCode && (
                    <Typography variant="body1"><strong>Postal Code:</strong> {resident.household.postalCode}</Typography>
                  )}
                  <Typography variant="body1"><strong>Country:</strong> {resident.household.country || 'Philippines'}</Typography>

                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" gutterBottom>Household Members:</Typography>
                  <ul>
                    {resident.household.residents?.map((member: any) => (
                      <li key={member.id}>
                        <Link href={`/residents/${member.id}`} passHref>
                          <Typography component="a" variant="body2" sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'none' }}>
                            {member.firstName} {member.lastName} {member.isHeadOfFamily && <Chip size="small" label="Head" color="info" sx={{ ml: 1, height: 20 }} />}
                          </Typography>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">No household data found.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resident History (Blotters & Documents) */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Resident History" />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Requested Documents</Typography>
                  {resident.documents?.length > 0 ? (
                    <ul>
                      {resident.documents.map((doc: any) => (
                        <li key={doc.id}>
                          <Typography variant="body2">{doc.type} - {doc.status} ({new Date(doc.requestedAt).toLocaleDateString()})</Typography>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No documents requested.</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Blotter Records</Typography>
                  {resident.blottersAsCom?.length > 0 || resident.blottersAsRes?.length > 0 ? (
                    <ul>
                      {resident.blottersAsCom?.map((blotter: any) => (
                        <li key={`com-${blotter.id}`}>
                          <Typography variant="body2">Complainant for Blotter #{blotter.blotterNumber} - {blotter.status}</Typography>
                        </li>
                      ))}
                      {resident.blottersAsRes?.map((blotter: any) => (
                        <li key={`res-${blotter.id}`}>
                          <Typography variant="body2" color="error">Respondent for Blotter #{blotter.blotterNumber} - {blotter.status}</Typography>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No blotter records found.</Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
