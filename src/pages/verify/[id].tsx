import { GetServerSideProps } from 'next'
import { PrismaClient } from '@prisma/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CheckCircleOutline from 'mdi-material-ui/CheckCircleOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const prisma = new PrismaClient()

export default function VerifyPage({ document, error }: any) {
  if (error || !document) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center', bgcolor: '#f5f5f5' }}>
        <Card sx={{ maxWidth: 400, textAlign: 'center', p: 4, borderRadius: 3 }}>
          <AlertCircleOutline sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error">Invalid Document</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>This document record could not be found or has been revoked.</Typography>
        </Card>
      </Box>
    )
  }

  const { resident, type, purpose, requestedAt, status } = document
  const isValid = status === 'RELEASED' || status === 'READY'

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center', bgcolor: '#f5f5f5' }}>
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center', p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {isValid ? (
          <>
            <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>VERIFIED</Typography>
            <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>Official Barangay Document</Typography>
          </>
        ) : (
          <>
            <AlertCircleOutline sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>PENDING / CANCELLED</Typography>
            <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>This document is not currently marked as released.</Typography>
          </>
        )}

        <Box sx={{ textAlign: 'left', mt: 3, p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Issued To</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            {`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`.toUpperCase()}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Document Type</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{type}</Typography>

          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Purpose</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{purpose || 'N/A'}</Typography>

          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Date Requested</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {new Date(requestedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}

VerifyPage.getLayout = (page: any) => <BlankLayout>{page}</BlankLayout>

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string
  if (!id) return { props: { error: true } }

  try {
    const doc = await prisma.documentRequest.findUnique({
      where: { id },
      include: {
        resident: true
      }
    })

    if (!doc) {
      return { props: { error: true } }
    }

    return {
      props: {
        document: JSON.parse(JSON.stringify(doc))
      }
    }
  } catch (error) {
    return { props: { error: true } }
  }
}
