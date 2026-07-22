import { useState, useEffect, useCallback } from 'react'
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
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import CircularProgress from '@mui/material/CircularProgress'

const statusColors: any = {
  PENDING: 'warning',
  PROCESSING: 'info',
  READY: 'primary',
  RELEASED: 'success',
  CANCELLED: 'error'
}

const PAGE_SIZE = 50

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0) // MUI TablePagination is 0-indexed
  const router = useRouter()

  const fetchDocuments = useCallback((currentPage: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(currentPage + 1) })

    fetch(`/api/documents?${params.toString()}`)
      .then(res => res.json())
      .then(result => {
        // API now returns { data, total, page, pageSize }
        setDocuments(Array.isArray(result.data) ? result.data : [])
        setTotal(result.total || 0)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchDocuments(page)
  }, [page, fetchDocuments])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        // Re-fetch the current page after a status change
        fetchDocuments(page)
      } else {
        console.error('Failed to update status')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant='h5'>Document Requests</Typography>
          {!loading && (
            <Typography variant='body2' color='textSecondary'>
              {total.toLocaleString()} total requests
            </Typography>
          )}
        </Box>
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
                <TableCell align='center'>Released Date</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='right'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                    <Typography variant='body2' color='textSecondary' sx={{ mt: 1 }}>
                      Loading requests...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    No document requests found.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc: any) => (
                  <TableRow key={doc.id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell component='th' scope='row'>{doc.queueNumber}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.resident?.firstName} {doc.resident?.lastName}</TableCell>
                    <TableCell>{doc.purpose}</TableCell>
                    <TableCell align='center'>
                      {doc.releasedAt ? new Date(doc.releasedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align='center'>
                      <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                          disableUnderline
                          sx={{
                            '& .MuiSelect-select': {
                              py: 0.5,
                              px: 1,
                              borderRadius: 1,
                              bgcolor: statusColors[doc.status] ? `${statusColors[doc.status]}.main` : 'default',
                              color: statusColors[doc.status] ? `${statusColors[doc.status]}.contrastText` : 'inherit',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textAlign: 'center'
                            }
                          }}
                        >
                          <MenuItem value='PENDING'>PENDING</MenuItem>
                          <MenuItem value='PROCESSING'>PROCESSING</MenuItem>
                          <MenuItem value='READY'>READY</MenuItem>
                          <MenuItem value='RELEASED'>RELEASED</MenuItem>
                          <MenuItem value='CANCELLED'>CANCELLED</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align='right' sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size='small' variant='outlined' onClick={() => router.push(`/documents/print/${doc.id}`)}>
                        Preview
                      </Button>
                      <Button
                        size='small'
                        variant='contained'
                        color='primary'
                        onClick={() => window.open(`/api/documents/${doc.id}/generate-pdf`, '_blank')}
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Server-side Pagination Controls */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} of ${count !== -1 ? count.toLocaleString() : `more than ${to}`}`
          }
        />
      </Card>
    </Box>
  )
}
