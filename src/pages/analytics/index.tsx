import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import FileExportOutline from 'mdi-material-ui/FileExportOutline'
import AccountGroupOutline from 'mdi-material-ui/AccountGroupOutline'
import LockOutline from 'mdi-material-ui/LockOutline'
import BullhornOutline from 'mdi-material-ui/BullhornOutline'

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const AnalyticsDashboard = () => {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or Failed to load analytics')
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <Typography>Loading analytics data...</Typography>
  if (error) return <Typography color="error">{error}</Typography>
  if (!data) return <Typography>No data available.</Typography>

  const { summary, demographics, blotterStats } = data

  // Prepare chart data
  const genderSeries = demographics.genderData.map((d: any) => d._count.gender)
  const genderLabels = demographics.genderData.map((d: any) => d.gender)

  const civilStatusSeries = demographics.civilStatusData.map((d: any) => d._count.civilStatus)
  const civilStatusLabels = demographics.civilStatusData.map((d: any) => d.civilStatus)

  const blotterSeries = [{ name: 'Cases', data: blotterStats.statusData.map((d: any) => d._count.status) }]
  const blotterCategories = blotterStats.statusData.map((d: any) => d.status)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h5'>Analytics & Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileExportOutline />} href="/api/analytics/export?type=residents" target="_blank">
            Export Residents (CSV)
          </Button>
          <Button variant="outlined" startIcon={<FileExportOutline />} href="/api/analytics/export?type=blotters" target="_blank">
            Export Blotters (CSV)
          </Button>
        </Box>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
          color: 'white',
          boxShadow: '0 4px 20px 0 rgba(30, 136, 229, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='subtitle2' sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>
                Total Residents
              </Typography>
              <Typography variant='h4' sx={{ color: 'white', fontWeight: 700 }}>{summary.totalResidents}</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <AccountGroupOutline sx={{ fontSize: 32, color: 'white' }} />
            </Box>
          </CardContent>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
          color: 'white',
          boxShadow: '0 4px 20px 0 rgba(229, 57, 53, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='subtitle2' sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>
                Total Blotter Cases
              </Typography>
              <Typography variant='h4' sx={{ color: 'white', fontWeight: 700 }}>{summary.totalBlotters}</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <LockOutline sx={{ fontSize: 32, color: 'white' }} />
            </Box>
          </CardContent>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%)',
          color: 'white',
          boxShadow: '0 4px 20px 0 rgba(142, 36, 170, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='subtitle2' sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>
                Total Announcements
              </Typography>
              <Typography variant='h4' sx={{ color: 'white', fontWeight: 700 }}>{summary.totalAnnouncements}</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <BullhornOutline sx={{ fontSize: 32, color: 'white' }} />
            </Box>
          </CardContent>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
        </Card>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
          <CardHeader title="Gender Demographics" titleTypographyProps={{ sx: { fontWeight: 600 } }} />
          <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
            {genderSeries.length > 0 ? (
              <ReactApexcharts 
                options={{ 
                  labels: genderLabels, 
                  colors: ['#0288d1', '#e91e63', '#757575'],
                  stroke: { width: 0 },
                  legend: { position: 'bottom', markers: { radius: 12 } } 
                }} 
                series={genderSeries} 
                type="pie" 
                height={320} 
                width="100%"
              />
            ) : <Typography color="textSecondary" sx={{ mt: 5 }}>No data available</Typography>}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
          <CardHeader title="Civil Status Demographics" titleTypographyProps={{ sx: { fontWeight: 600 } }} />
          <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
            {civilStatusSeries.length > 0 ? (
              <ReactApexcharts 
                options={{ 
                  labels: civilStatusLabels, 
                  colors: ['#43a047', '#ff9800', '#1e88e5', '#8e24aa', '#e53935'],
                  stroke: { width: 0 },
                  legend: { position: 'bottom', markers: { radius: 12 } },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: '65%',
                        labels: { show: true, name: { fontSize: '14px' }, value: { fontSize: '20px', fontWeight: 600 } }
                      }
                    }
                  }
                }} 
                series={civilStatusSeries} 
                type="donut" 
                height={320} 
                width="100%"
              />
            ) : <Typography color="textSecondary" sx={{ mt: 5 }}>No data available</Typography>}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: '0 4px 18px 0 rgba(0,0,0,0.05)' }}>
          <CardHeader title="Blotter Cases by Status" titleTypographyProps={{ sx: { fontWeight: 600 } }} />
          <CardContent>
            {blotterSeries[0].data.length > 0 ? (
              <ReactApexcharts 
                options={{ 
                  xaxis: { categories: blotterCategories, labels: { style: { fontWeight: 500 } } },
                  yaxis: { labels: { style: { fontWeight: 600, fontSize: '13px' } } },
                  colors: ['#e53935'],
                  plotOptions: { 
                    bar: { 
                      borderRadius: 6, 
                      horizontal: true,
                      dataLabels: { position: 'top' }
                    } 
                  },
                  dataLabels: {
                    enabled: true,
                    offsetX: 20,
                    style: { fontSize: '13px', colors: ['#333'] }
                  },
                  grid: { strokeDashArray: 4 }
                }} 
                series={blotterSeries} 
                type="bar" 
                height={350} 
              />
            ) : <Typography color="textSecondary" sx={{ mt: 5 }}>No data available</Typography>}
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  )
}

export default AnalyticsDashboard
