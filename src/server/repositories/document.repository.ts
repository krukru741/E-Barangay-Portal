import { prisma } from 'src/lib/db'
import { DocumentRequestInput } from 'src/lib/validations/document.schema'

export async function findAllDocumentRequests() {
  return await prisma.documentRequest.findMany({
    include: {
      resident: true,
      issuedBy: true
    },
    orderBy: { requestedAt: 'desc' }
  })
}

export async function createDocumentRequestRecord(data: DocumentRequestInput) {
  // Generate a simple queue number based on date and random string
  const queueNumber = `Q-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

  return await prisma.documentRequest.create({
    data: {
      type: data.type,
      purpose: data.purpose,
      residentId: data.residentId,
      remarks: data.remarks || null,
      queueNumber: queueNumber,
      status: 'PENDING',
      cedulaNumber: data.cedulaNumber || null,
      cedulaIssuedAt: data.cedulaIssuedAt ? new Date(data.cedulaIssuedAt) : null,
      feeAmount: data.feeAmount || 0,
      orNumber: data.orNumber || null,
      businessName: data.businessName || null,
      businessAddress: data.businessAddress || null,
      urgency: data.urgency || 'REGULAR',
    }
  })
}

export async function findDocumentRequestById(id: string) {
  return await prisma.documentRequest.findUnique({
    where: { id },
    include: {
      resident: {
        include: { household: true }
      },
      issuedBy: true
    }
  })
}

export async function updateDocumentStatus(id: string, status: any, issuedById?: string) {
  return await prisma.documentRequest.update({
    where: { id },
    data: {
      status,
      issuedById: issuedById || undefined,
      releasedAt: status === 'RELEASED' ? new Date() : undefined
    }
  })
}
