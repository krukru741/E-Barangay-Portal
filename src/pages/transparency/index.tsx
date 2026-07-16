import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
}

const TransparencyBoard = () => {
  const [data, setData] = useState<{ budgets: any[], expenditures: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/finance/budget').then(async r => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Failed to fetch budgets');
        return json;
      }),
      fetch('/api/finance/expenditures').then(async r => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || 'Failed to fetch expenditures');
        return json;
      })
    ]).then(([budgets, expenditures]) => {
      setData({ 
        budgets: Array.isArray(budgets) ? budgets : [], 
        expenditures: Array.isArray(expenditures) ? expenditures : [] 
      })
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setError(err.message)
      setLoading(false)
    })
  }, [])

  if (loading) return <Typography>Loading transparency records...</Typography>
  if (error) return <Typography color="error">Error: {error}. Please ensure the database schema is updated (Run `npx prisma db push`).</Typography>
  if (!data) return <Typography>No data available</Typography>

  const totalBudget = data.budgets.reduce((sum, b) => sum + b.totalAmount, 0)
  const totalExpense = data.expenditures.reduce((sum, e) => sum + e.amount, 0)
  const remaining = totalBudget - totalExpense

  // Group expenditures by category for Pie Chart
  const categoryTotals: Record<string, number> = {}
  data.expenditures.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })
  
  const chartSeries = Object.values(categoryTotals)
  const chartLabels = Object.keys(categoryTotals)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Full Disclosure Policy Board</Typography>
        <Typography variant='body1' color="textSecondary">
          Kini nga dashboard nagpakita sa mga pundo ug mga nagasto sa atong Barangay aron pagsiguro nga limpyo ug klaro ang atong pagdumala.
        </Typography>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12} md={4}>
        <Card sx={{ backgroundColor: 'success.light' }}>
          <CardContent>
            <Typography variant='h6' color="white">Total Budget</Typography>
            <Typography variant='h4' color="white">{formatPHP(totalBudget)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ backgroundColor: 'error.light' }}>
          <CardContent>
            <Typography variant='h6' color="white">Total Expenditures</Typography>
            <Typography variant='h4' color="white">{formatPHP(totalExpense)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ backgroundColor: 'info.light' }}>
          <CardContent>
            <Typography variant='h6' color="white">Remaining Balance</Typography>
            <Typography variant='h4' color="white">{formatPHP(remaining)}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Expenses by Category" />
          <CardContent>
            {chartSeries.length > 0 ? (
              <ReactApexcharts 
                options={{ 
                  labels: chartLabels,
                  tooltip: { y: { formatter: val => formatPHP(val) } }
                }} 
                series={chartSeries} 
                type="pie" 
                height={350} 
              />
            ) : <Typography>No expenditures recorded yet.</Typography>}
          </CardContent>
        </Card>
      </Grid>

      {/* Expense List (Privacy compliant: no payee, no receipts) */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Recent Expenditures" subheader="Ang detalye sa gipamalit (Public View)" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.expenditures.slice(0, 10).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align="right">{formatPHP(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TransparencyBoard
