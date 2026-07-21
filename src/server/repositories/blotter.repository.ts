import { prisma } from 'src/lib/db'
import { BlotterInput, HearingInput } from 'src/lib/validations/blotter.schema'
import { BlotterStatus } from '@prisma/client'

export async function findAllBlotters() {
  return await prisma.blotter.findMany({
    orderBy: { filedAt: 'desc' },
    include: {
      complainant: {
        select: { id: true, firstName: true, lastName: true }
      },
      respondent: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })
}

export async function findBlotterById(id: string) {
  return await prisma.blotter.findUnique({
    where: { id },
    include: {
      complainant: { include: { household: true } },
      respondent: { include: { household: true } },
      hearings: {
        orderBy: { scheduledAt: 'desc' }
      }
    }
  })
}

export async function createBlotterRecord(data: BlotterInput) {
  return await prisma.blotter.create({
    data: {
      blotterNumber: data.blotterNumber,
      incidentType: data.incidentType,
      incidentDate: new Date(data.incidentDate),
      location: data.location,
      narrative: data.narrative,
      complainantId: data.complainantId || null,
      complainantName: data.complainantName || null,
      respondentId: data.respondentId || null,
      respondentName: data.respondentName || null,
      witnesses: data.witnesses || null,
      actionTaken: data.actionTaken || null,
      status: BlotterStatus.OPEN
    }
  })
}

export async function updateBlotterStatus(id: string, status: BlotterStatus, actionTaken?: string) {
  const dataToUpdate: any = {
    status,
    resolvedAt: status === BlotterStatus.RESOLVED ? new Date() : null
  }
  
  if (actionTaken !== undefined) {
    dataToUpdate.actionTaken = actionTaken
  }
  
  return await prisma.blotter.update({
    where: { id },
    data: dataToUpdate
  })
}

export async function addHearingToBlotter(blotterId: string, data: HearingInput) {
  return await prisma.hearing.create({
    data: {
      blotterId,
      scheduledAt: new Date(data.scheduledAt),
      outcome: data.outcome,
      attendees: data.attendees || []
    }
  })
}

export async function getNextBlotterNumber() {
  const count = await prisma.blotter.count()
  const nextSequence = count + 1
  
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  
  // Format: BLOTTER-YYYYMMDD-00001
  const sequenceStr = String(nextSequence).padStart(5, '0')
  return `BLOTTER-${yyyy}${mm}${dd}-${sequenceStr}`
}
