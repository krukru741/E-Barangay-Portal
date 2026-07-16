import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

const AdminFinancePage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [budgetForm, setBudgetForm] = useState({ year: new Date().getFullYear(), totalAmount: 0, source: 'IRA', description: '' })
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], amount: 0, category: 'Infrastructure', payee: '', description: '' })

  const isAdmin = session && ['ADMIN', 'SUPER_ADMIN'].includes((session.user as any)?.role)

  useEffect(() => {
    if (session && !isAdmin) {
      router.replace('/transparency')
    } else {
      setLoading(false)
    }
  }, [session, isAdmin, router])

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/finance/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...budgetForm, year: Number(budgetForm.year), totalAmount: Number(budgetForm.totalAmount) })
    })
    alert('Budget Added Successfully')
    setBudgetForm({ ...budgetForm, totalAmount: 0 })
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/finance/expenditures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...expenseForm, amount: Number(expenseForm.amount) })
    })
    alert('Expenditure Added Successfully')
    setExpenseForm({ ...expenseForm, amount: 0, payee: '', description: '' })
  }

  if (loading) return <Typography>Loading...</Typography>
  if (!isAdmin) return null

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5'>Finance Management (Admin Only)</Typography>
        <Typography variant='body2' color="textSecondary">Add budgets or record expenditures. These will reflect on the Public Transparency Board.</Typography>
      </Grid>

      {/* Add Budget */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Add New Budget" />
          <CardContent>
            <form onSubmit={handleAddBudget}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Year" type="number" value={budgetForm.year} onChange={e => setBudgetForm({...budgetForm, year: parseInt(e.target.value)})} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Total Amount (PHP)" type="number" value={budgetForm.totalAmount} onChange={e => setBudgetForm({...budgetForm, totalAmount: parseFloat(e.target.value)})} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField select fullWidth label="Source of Fund" value={budgetForm.source} onChange={e => setBudgetForm({...budgetForm, source: e.target.value})} required>
                    <MenuItem value="IRA">Internal Revenue Allotment (IRA)</MenuItem>
                    <MenuItem value="Local Fund">Local Barangay Fund</MenuItem>
                    <MenuItem value="SK Fund">SK Fund</MenuItem>
                    <MenuItem value="Donation">Donations</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Description / Resolution No." value={budgetForm.description} onChange={e => setBudgetForm({...budgetForm, description: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth>Save Budget</Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Add Expenditure */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Record Expenditure" />
          <CardContent>
            <form onSubmit={handleAddExpense}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Date" type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Amount (PHP)" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: parseFloat(e.target.value)})} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField select fullWidth label="Category" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} required>
                    <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                    <MenuItem value="Health">Health & Sanitation</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Office Supplies">Office / Admin Supplies</MenuItem>
                    <MenuItem value="Emergency">Emergency / Calamity</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Payee / Supplier Name" value={expenseForm.payee} onChange={e => setExpenseForm({...expenseForm, payee: e.target.value})} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Description / Purpose" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} required />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="secondary" fullWidth>Record Expense</Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminFinancePage
