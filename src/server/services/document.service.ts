import { findAllDocumentRequests, countDocumentRequests, createDocumentRequestRecord, updateDocumentStatus, findDocumentRequestById } from '../repositories/document.repository'
import { DocumentRequestInput } from 'src/lib/validations/document.schema'
import { logAudit } from './audit.service'

export async function getDocumentRequests(page = 1) {
  const [data, total] = await Promise.all([
    findAllDocumentRequests(page),
    countDocumentRequests(),
  ])
  return { data, total, page, pageSize: 50 }
}

export async function createDocumentRequest(data: DocumentRequestInput) {
  return await createDocumentRequestRecord(data)
}

export async function updateRequestStatus(id: string, status: string, issuedById?: string) {
  const updated = await updateDocumentStatus(id, status, issuedById)

  if (issuedById) {
    await logAudit({
      userId: issuedById,
      action: 'UPDATE',
      entity: 'DOCUMENT_REQUEST',
      entityId: id,
      details: { newStatus: status, type: updated.type }
    })
  }

  return updated
}

export async function getDocumentRequest(id: string) {
  return await findDocumentRequestById(id)
}
