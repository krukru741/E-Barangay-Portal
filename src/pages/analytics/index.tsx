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
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='caption'>Total Residents</Typography>
              <Typography variant='h5'>{summary.totalResidents}</Typography>
            </Box>
            <AccountGroupOutline sx={{ fontSize: 40, color: 'primary.main' }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='caption'>Total Blotter Cases</Typography>
              <Typography variant='h5'>{summary.totalBlotters}</Typography>
            </Box>
            <LockOutline sx={{ fontSize: 40, color: 'error.main' }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='caption'>Total Announcements</Typography>
              <Typography variant='h5'>{summary.totalAnnouncements}</Typography>
            </Box>
            <BullhornOutline sx={{ fontSize: 40, color: 'info.main' }} />
          </CardContent>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Gender Demographics" />
          <CardContent>
            {genderSeries.length > 0 ? (
              <ReactApexcharts 
                options={{ labels: genderLabels, legend: { position: 'bottom' } }} 
                series={genderSeries} 
                type="pie" 
                height={300} 
              />
            ) : <Typography>No data</Typography>}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Civil Status Demographics" />
          <CardContent>
            {civilStatusSeries.length > 0 ? (
              <ReactApexcharts 
                options={{ labels: civilStatusLabels, legend: { position: 'bottom' } }} 
                series={civilStatusSeries} 
                type="donut" 
                height={300} 
              />
            ) : <Typography>No data</Typography>}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Blotter Cases by Status" />
          <CardContent>
            {blotterSeries[0].data.length > 0 ? (
              <ReactApexcharts 
                options={{ 
                  xaxis: { categories: blotterCategories },
                  plotOptions: { bar: { borderRadius: 4, horizontal: true } }
                }} 
                series={blotterSeries} 
                type="bar" 
                height={350} 
              />
            ) : <Typography>No data</Typography>}
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  )
}

export default AnalyticsDashboard
