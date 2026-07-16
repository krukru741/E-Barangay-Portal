import { findAllDocumentRequests, createDocumentRequestRecord, updateDocumentStatus, findDocumentRequestById } from '../repositories/document.repository'
import { DocumentRequestInput } from 'src/lib/validations/document.schema'

export async function getDocumentRequests() {
  return await findAllDocumentRequests()
}

export async function createDocumentRequest(data: DocumentRequestInput) {
  return await createDocumentRequestRecord(data)
}

export async function updateRequestStatus(id: string, status: string, issuedById?: string) {
  return await updateDocumentStatus(id, status, issuedById)
}

export async function getDocumentRequest(id: string) {
  return await findDocumentRequestById(id)
}
