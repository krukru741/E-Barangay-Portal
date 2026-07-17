import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Link from 'next/link'

const statusColorMap: any = {
  OPEN: 'warning',
  MEDIATION: 'info',
  RESOLVED: 'success',
  ESCALATED: 'error',
  CLOSED: 'default'
}

const BlotterDashboard = () => {
  const [blotters, setBlotters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/blotters')
      .then(res => {
        if (!res.ok) {
          if (res.status === 403) throw new Error('You do not have permission to view blotter records.')
          throw new Error('Failed to fetch blotters')
        }
        return res.json()
      })
      .then(data => {
        setBlotters(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>
          Blotter & Incident Management
        </Typography>
        <Typography variant='body2'>CONFIDENTIAL: For Admin & Authorized Staff Only</Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Blotter Cases' 
            titleTypographyProps={{ variant: 'h6' }} 
            action={
              <Link href="/blotter/create" passHref>
                <Button variant="contained" size="small">File New Blotter</Button>
              </Link>
            }
          />
          
          {error ? (
            <Typography color="error" sx={{ p: 4 }}>{error}</Typography>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
                <TableHead>
                  <TableRow>
                    <TableCell>Blotter No.</TableCell>
                    <TableCell>Incident Type</TableCell>
                    <TableCell>Date Filed</TableCell>
                    <TableCell>Complainant</TableCell>
                    <TableCell>Respondent</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Loading records...</TableCell>
                    </TableRow>
                  ) : blotters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No blotter records found.</TableCell>
                    </TableRow>
                  ) : (
                    blotters.map((row) => (
                      <TableRow hover key={row.id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                        <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.blotterNumber}</Typography>
                        </TableCell>
                        <TableCell>{row.incidentType}</TableCell>
                        <TableCell>{new Date(row.filedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{row.complainant ? `${row.complainant.firstName} ${row.complainant.lastName}` : row.complainantName}</TableCell>
                        <TableCell>{row.respondent ? `${row.respondent.firstName} ${row.respondent.lastName}` : row.respondentName}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            color={statusColorMap[row.status] || 'primary'}
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              textTransform: 'capitalize',
                              '& .MuiChip-label': { fontWeight: 500 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Link href={`/blotter/${row.id}`} passHref>
                            <Button size="small" variant="outlined">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

export default BlotterDashboard
