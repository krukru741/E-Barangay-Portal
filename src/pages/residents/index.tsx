import { useState, useEffect, useCallback } from 'react'
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
import TablePagination from '@mui/material/TablePagination'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Magnify from 'mdi-material-ui/Magnify'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

const PAGE_SIZE = 50

// Debounce hook — waits 400ms after last keystroke before firing the search.
// This prevents a DB query on every character the user types.
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0) // MUI TablePagination is 0-indexed
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')

  // Debounce the search input so we don't hammer the API on every keystroke
  const debouncedSearch = useDebounce(search, 400)

  const fetchResidents = useCallback(() => {
    setLoading(true)

    // Build query string
    const params = new URLSearchParams()
    params.set('page', String(page + 1)) // API is 1-indexed
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (sortBy && sortBy !== 'date') params.set('sortBy', sortBy)

    fetch(`/api/residents?${params.toString()}`)
      .then(res => res.json())
      .then(result => {
        // API now returns { data, total, page, pageSize }
        setResidents(Array.isArray(result.data) ? result.data : [])
        setTotal(result.total || 0)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [page, debouncedSearch, sortBy])

  // Re-fetch whenever page, debounced search, or sort changes
  useEffect(() => {
    fetchResidents()
  }, [fetchResidents])

  // When search or sort changes, reset to first page
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPage(0)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Box>
          <Typography variant='h5'>Resident Registry</Typography>
          {!loading && (
            <Typography variant='body2' color='textSecondary'>
              {total.toLocaleString()} total residents
            </Typography>
          )}
        </Box>
        <Link href='/residents/create' passHref>
          <Button variant='contained'>Add New Resident</Button>
        </Link>
      </Box>

      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={8} md={9}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by resident name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Magnify />
                  </InputAdornment>
                ),
                endAdornment: loading && search ? (
                  <InputAdornment position="end">
                    <CircularProgress size={18} />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <MenuItem value="date">Date Registered (Newest)</MenuItem>
                <MenuItem value="alphabetical">Alphabetical (A-Z)</MenuItem>
                <MenuItem value="sitio">Sitio (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label='residents table'>
            <TableHead>
              <TableRow>
                <TableCell>ID Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Sitio</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                    <Typography variant='body2' color='textSecondary' sx={{ mt: 1 }}>
                      Loading residents...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : residents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    {debouncedSearch
                      ? `No residents found matching "${debouncedSearch}"`
                      : 'No residents found.'}
                  </TableCell>
                </TableRow>
              ) : (
                residents.map((resident: any) => (
                  <TableRow
                    key={resident.id}
                    sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                  >
                    <TableCell component='th' scope='row'>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {resident.id.substring(resident.id.length - 8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {resident.firstName} {resident.lastName}
                    </TableCell>
                    <TableCell>{resident.gender}</TableCell>
                    <TableCell>{resident.civilStatus}</TableCell>
                    <TableCell>
                      {resident.isSenior && <Chip size="small" label="Senior" sx={{ mr: 1 }} color="primary" />}
                      {resident.isPWD && <Chip size="small" label="PWD" sx={{ mr: 1 }} color="secondary" />}
                      {resident.isIndigent && <Chip size="small" label="Indigent" sx={{ mr: 1 }} color="error" />}
                      {resident.isVoter && <Chip size="small" label="Voter" color="success" />}
                    </TableCell>
                    <TableCell>
                      {resident.household?.sitio
                        ? resident.household.sitio
                        : <Typography variant="caption" color="textSecondary">N/A</Typography>}
                    </TableCell>
                    <TableCell align='right'>
                      <Link href={`/residents/${resident.id}`} passHref>
                        <Button variant="outlined" size="small">View Profile</Button>
                      </Link>
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
