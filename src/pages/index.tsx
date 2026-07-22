import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from 'next/link'
import AccountGroupOutline from 'mdi-material-ui/AccountGroupOutline'
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline'
import LockOutline from 'mdi-material-ui/LockOutline'
import AccountTieOutline from 'mdi-material-ui/AccountTieOutline'
import ChevronRight from 'mdi-material-ui/ChevronRight'
import BullhornOutline from 'mdi-material-ui/BullhornOutline'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const statusColorMap: any = {
  PENDING: 'warning', PROCESSING: 'info', READY: 'primary', RELEASED: 'success', CANCELLED: 'error'
}
const blotterColorMap: any = {
  OPEN: 'warning', ONGOING: 'info', RESOLVED: 'success', ESCALATED: 'error', CLOSED: 'default'
}

const Dashboard = () => {
  const { data: session } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [recentDocs, setRecentDocs] = useState<any[]>([])
  const [recentBlotters, setRecentBlotters] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Single API call that returns all dashboard data pre-aggregated.
    // Previously: 4 separate fetches that over-fetched ALL records.
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        setStats(data.summary)
        setRecentDocs(data.recentDocuments || [])
        setRecentBlotters(data.recentBlotters || [])
        setAnnouncements(data.latestAnnouncements || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err)
        setLoading(false)
      })
  }, [])

  const userName = (session?.user as any)?.name || 'User'

  const statCards = [
    { label: 'Total Residents', value: stats?.totalResidents ?? '—', icon: <AccountGroupOutline sx={{ fontSize: 32, color: 'white' }} />, gradient: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)', shadow: 'rgba(30,136,229,0.4)', link: '/residents' },
    { label: 'Document Requests', value: recentDocs.length > 0 ? (recentDocs.filter(d => d.status === 'PENDING').length + ' Pending') : '—', icon: <FileDocumentOutline sx={{ fontSize: 32, color: 'white' }} />, gradient: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)', shadow: 'rgba(255,152,0,0.4)', link: '/documents' },
    { label: 'Blotter Cases', value: stats?.totalBlotters ?? '—', icon: <LockOutline sx={{ fontSize: 32, color: 'white' }} />, gradient: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)', shadow: 'rgba(229,57,53,0.4)', link: '/blotter' },
    { label: 'Announcements', value: stats?.totalAnnouncements ?? '—', icon: <BullhornOutline sx={{ fontSize: 32, color: 'white' }} />, gradient: 'linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%)', shadow: 'rgba(142,36,170,0.4)', link: '/announcements' },
  ]

  return (
    <Grid container spacing={6}>
      {/* Welcome Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>Welcome back, {userName}! 👋</Typography>
            <Typography variant='body2' color='textSecondary'>
              Here's what's happening in your barangay today.
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Summary Cards */}
      {statCards.map(card => (
        <Grid item xs={12} sm={6} md={3} key={card.label}>
          <Card sx={{
            background: card.gradient,
            boxShadow: `0 4px 20px 0 ${card.shadow}`,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}
            onClick={() => window.location.href = card.link}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem', mb: 0.5 }}>
                    {card.label}
                  </Typography>
                  <Typography variant='h4' sx={{ color: 'white', fontWeight: 700 }}>
                    {loading ? '...' : card.value}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
          </Card>
        </Grid>
      ))}

      {/* Recent Document Requests */}
      <Grid item xs={12} md={7}>
        <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)', height: '100%' }}>
          <CardHeader
            title='Recent Document Requests'
            titleTypographyProps={{ sx: { fontWeight: 600 } }}
            action={<Link href='/documents' passHref><Button endIcon={<ChevronRight />} size='small'>View All</Button></Link>}
          />
          <TableContainer>
            <Table size='small'>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Queue #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Resident</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} align='center'>Loading...</TableCell></TableRow>
                ) : recentDocs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align='center'>No document requests yet</TableCell></TableRow>
                ) : recentDocs.map((doc: any) => (
                  <TableRow key={doc.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{doc.queueNumber || '—'}</TableCell>
                    <TableCell>{doc.resident?.firstName} {doc.resident?.lastName}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{doc.type}</TableCell>
                    <TableCell>
                      <Chip label={doc.status} color={statusColorMap[doc.status]} size='small' sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      {/* Recent Blotters + Announcements */}
      <Grid item xs={12} md={5}>
        <Grid container spacing={4} sx={{ height: '100%' }}>
          {/* Recent Blotters */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
              <CardHeader
                title='Recent Blotter Cases'
                titleTypographyProps={{ sx: { fontWeight: 600 } }}
                action={<Link href='/blotter' passHref><Button endIcon={<ChevronRight />} size='small'>View All</Button></Link>}
              />
              <TableContainer>
                <Table size='small'>
                  <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Blotter #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Incident</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={3} align='center'>Loading...</TableCell></TableRow>
                    ) : recentBlotters.length === 0 ? (
                      <TableRow><TableCell colSpan={3} align='center'>No blotter cases yet</TableCell></TableRow>
                    ) : recentBlotters.map((b: any) => (
                      <TableRow key={b.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{b.blotterNumber}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.incidentType}</TableCell>
                        <TableCell>
                          <Chip label={b.status} color={blotterColorMap[b.status]} size='small' sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Latest Announcements */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
              <CardHeader
                title='Latest Announcements'
                titleTypographyProps={{ sx: { fontWeight: 600 } }}
                action={<Link href='/announcements' passHref><Button endIcon={<ChevronRight />} size='small'>View All</Button></Link>}
              />
              <CardContent sx={{ pt: 0 }}>
                {loading ? <Typography color='textSecondary'>Loading...</Typography>
                : announcements.length === 0 ? <Typography variant='body2' color='textSecondary'>No announcements yet</Typography>
                : announcements.map((a: any) => (
                  <Box key={a.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0', '&:last-child': { border: 0, mb: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={a.type} size='small' sx={{ fontSize: '0.65rem' }} />
                      {a.isPinned && <Chip label='📌 Pinned' size='small' color='primary' sx={{ fontSize: '0.65rem' }} />}
                    </Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>{a.title}</Typography>
                    <Typography variant='caption' color='textSecondary'>{new Date(a.publishedAt).toLocaleDateString()}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Dashboard
