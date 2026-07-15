import { useState, useEffect } from 'react'
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/residents')
      .then(res => res.json())
      .then(data => {
        setResidents(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant='h5'>
          Resident Registry
        </Typography>
        <Link href='/residents/create' passHref>
          <Button variant='contained'>Add New Resident</Button>
        </Link>
      </Box>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align='right'>Gender</TableCell>
                <TableCell align='right'>Civil Status</TableCell>
                <TableCell align='right'>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align='center'>Loading residents...</TableCell>
                </TableRow>
              ) : residents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align='center'>No residents found.</TableCell>
                </TableRow>
              ) : (
                residents.map((resident: any) => (
                  <TableRow
                    key={resident.id}
                    sx={{
                      '&:last-of-type td, &:last-of-type th': {
                        border: 0
                      }
                    }}
                  >
                    <TableCell component='th' scope='row'>
                      {resident.firstName} {resident.lastName}
                    </TableCell>
                    <TableCell align='right'>{resident.gender}</TableCell>
                    <TableCell align='right'>{resident.civilStatus}</TableCell>
                    <TableCell align='right'>{resident.contactNumber || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
