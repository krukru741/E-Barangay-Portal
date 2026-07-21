import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function AuditLogsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const router = useRouter()

  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    if (session && !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      router.replace('/')
    } else if (session) {
      fetchLogs()
    }
  }, [session, role, router])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs')
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="System Audit Logs" 
            subheader="View all major actions performed in the system. Strictly for SUPER_ADMIN." 
          />
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{log.user?.name || log.userId}</TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{log.entity} ({log.entityId})</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {JSON.stringify(log.details)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
