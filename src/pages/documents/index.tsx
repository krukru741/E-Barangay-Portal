import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

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
import Chip from '@mui/material/Chip'

const statusColors: any = {
  PENDING: 'warning',
  PROCESSING: 'info',
  READY: 'primary',
  RELEASED: 'success',
  CANCELLED: 'error'
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data)
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
          Document Requests
        </Typography>
        <Link href='/documents/request' passHref>
          <Button variant='contained'>New Request</Button>
        </Link>
      </Box>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label='documents table'>
            <TableHead>
              <TableRow>
                <TableCell>Queue #</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Resident Name</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='right'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>Loading requests...</TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>No document requests found.</TableCell>
                </TableRow>
              ) : (
                documents.map((doc: any) => (
                  <TableRow key={doc.id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell component='th' scope='row'>{doc.queueNumber}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.resident?.firstName} {doc.resident?.lastName}</TableCell>
                    <TableCell>{doc.purpose}</TableCell>
                    <TableCell align='center'>
                      <Chip label={doc.status} color={statusColors[doc.status] || 'default'} size='small' />
                    </TableCell>
                    <TableCell align='right'>
                      <Button size='small' variant='outlined' onClick={() => router.push(`/documents/print/${doc.id}`)}>
                        Print
                      </Button>
                    </TableCell>
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
