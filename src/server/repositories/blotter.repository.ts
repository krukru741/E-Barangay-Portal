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
      complainant: true,
      respondent: true,
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
      complainantId: data.complainantId,
      respondentId: data.respondentId,
      status: BlotterStatus.OPEN
    }
  })
}

export async function updateBlotterStatus(id: string, status: BlotterStatus) {
  return await prisma.blotter.update({
    where: { id },
    data: { 
      status,
      resolvedAt: status === BlotterStatus.RESOLVED ? new Date() : null 
    }
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
