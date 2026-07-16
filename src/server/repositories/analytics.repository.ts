import { prisma } from 'src/lib/db'

export async function getSummaryCounts() {
  const [totalResidents, totalBlotters, totalAnnouncements] = await Promise.all([
    prisma.resident.count(),
    prisma.blotter.count(),
    prisma.announcement.count()
  ])
  return { totalResidents, totalBlotters, totalAnnouncements }
}

export async function getDemographics() {
  const genderData = await prisma.resident.groupBy({
    by: ['gender'],
    _count: { gender: true }
  })

  const civilStatusData = await prisma.resident.groupBy({
    by: ['civilStatus'],
    _count: { civilStatus: true }
  })

  return { genderData, civilStatusData }
}

export async function getBlotterStats() {
  const statusData = await prisma.blotter.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  return { statusData }
}

// For CSV Exports
export async function getAllResidentsForExport() {
  return await prisma.resident.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      gender: true,
      birthDate: true,
      civilStatus: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getAllBlottersForExport() {
  return await prisma.blotter.findMany({
    select: {
      blotterNumber: true,
      incidentType: true,
      status: true,
      filedAt: true,
      complainant: {
        select: { firstName: true, lastName: true }
      },
      respondent: {
        select: { firstName: true, lastName: true }
      }
    },
    orderBy: { filedAt: 'desc' }
  })
}
