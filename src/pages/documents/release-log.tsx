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
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

export default function ReleaseLogPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [filteredDocs, setFilteredDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState('')
  const [docType, setDocType] = useState('ALL')
  
  const router = useRouter()

  const fetchDocuments = () => {
    setLoading(true)
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        // Only keep released documents
        const released = data.filter((doc: any) => doc.status === 'RELEASED')
        // Sort by released date descending
        released.sort((a: any, b: any) => new Date(b.releasedAt || b.updatedAt).getTime() - new Date(a.releasedAt || a.updatedAt).getTime())
        setDocuments(released)
        setFilteredDocs(released)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Apply filters whenever search, docType, or documents change
  useEffect(() => {
    let result = documents

    if (docType !== 'ALL') {
      result = result.filter(d => d.type === docType)
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(d => 
        d.queueNumber.toLowerCase().includes(lowerSearch) ||
        (d.resident?.firstName + ' ' + d.resident?.lastName).toLowerCase().includes(lowerSearch) ||
        d.purpose.toLowerCase().includes(lowerSearch)
      )
    }

    setFilteredDocs(result)
  }, [search, docType, documents])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant='h5'>
          Release Log
        </Typography>
        <Link href='/documents' passHref>
          <Button variant='outlined'>Back to Document Requests</Button>
        </Link>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 5 }}>
        <Card sx={{ p: 3, flex: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h4">{documents.length}</Typography>
          <Typography variant="body2">Total Released Documents</Typography>
        </Card>
        <Card sx={{ p: 3, flex: 1, bgcolor: 'success.main', color: 'success.contrastText' }}>
          <Typography variant="h4">
             {documents.filter(d => d.type === 'CLEARANCE').length}
          </Typography>
          <Typography variant="body2">Clearances Issued</Typography>
        </Card>
        <Card sx={{ p: 3, flex: 1, bgcolor: 'info.main', color: 'info.contrastText' }}>
          <Typography variant="h4">
            {documents.filter(d => d.type !== 'CLEARANCE').length}
          </Typography>
          <Typography variant="body2">Certificates Issued</Typography>
        </Card>
      </Box>

      <Card>
        {/* Filter Area */}
        <Box sx={{ p: 4, display: 'flex', gap: 3, alignItems: 'center', borderBottom: '1px solid #eee' }}>
          <TextField
            size="small"
            label="Search (Queue #, Name, Purpose)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value='CLEARANCE'>Barangay Clearance</MenuItem>
              <MenuItem value='RESIDENCY'>Certificate of Residency</MenuItem>
              <MenuItem value='INDIGENCY'>Certificate of Indigency</MenuItem>
              <MenuItem value='BUSINESS'>Business Clearance</MenuItem>
              <MenuItem value='GOOD_MORAL'>Good Moral Character</MenuItem>
              <MenuItem value='ENDORSEMENT'>Endorsement Letter</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ ml: 'auto', color: 'text.secondary' }}>
            Showing {filteredDocs.length} records
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label='release log table'>
            <TableHead>
              <TableRow>
                <TableCell>Release Date</TableCell>
                <TableCell>Queue #</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Resident Name</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell align='right'>Fee (₱)</TableCell>
                <TableCell align='center'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>Loading release log...</TableCell>
                </TableRow>
              ) : filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>No released documents found.</TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc: any) => (
                  <TableRow key={doc.id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell>
                      {doc.releasedAt ? new Date(doc.releasedAt).toLocaleDateString() : new Date(doc.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell component='th' scope='row'>{doc.queueNumber}</TableCell>
                    <TableCell>
                      <Chip size="small" label={doc.type} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{doc.resident?.firstName} {doc.resident?.lastName}</TableCell>
                    <TableCell>{doc.purpose}</TableCell>
                    <TableCell align='right'>{doc.feeAmount}.00</TableCell>
                    <TableCell align='center'>
                      <Button size='small' variant='text' onClick={() => router.push(`/documents/print/${doc.id}`)}>
                        Reprint
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
