import { UserRole } from '@prisma/client'
import { getSummaryCounts, getDemographics, getBlotterStats, getAllResidentsForExport, getAllBlottersForExport } from '../repositories/analytics.repository'

function canViewAnalytics(userRole?: UserRole) {
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.STAFF && userRole !== UserRole.OFFICIAL && userRole !== UserRole.SUPER_ADMIN) {
    throw new Error('FORBIDDEN: You do not have permission to view analytics and reports')
  }
}

export async function getDashboardAnalytics(userRole: UserRole) {
  canViewAnalytics(userRole)
  
  const [summary, demographics, blotterStats] = await Promise.all([
    getSummaryCounts(),
    getDemographics(),
    getBlotterStats()
  ])

  return { summary, demographics, blotterStats }
}

export async function getExportData(type: string, userRole: UserRole) {
  canViewAnalytics(userRole)

  if (type === 'residents') {
    const data = await getAllResidentsForExport()
    // Convert to CSV
    const headers = ['ID, First Name, Last Name, Gender, Civil Status, Birth Date, Registered At']
    const rows = data.map(r => 
      `"${r.id}", "${r.firstName}", "${r.lastName}", "${r.gender}", "${r.civilStatus}", "${r.birthDate.toISOString().split('T')[0]}", "${r.createdAt.toISOString()}"`
    )
    return headers.concat(rows).join('\n')
  }

  if (type === 'blotters') {
    const data = await getAllBlottersForExport()
    const headers = ['Blotter Number, Incident Type, Status, Filed At, Complainant, Respondent']
    const rows = data.map(b => 
      `"${b.blotterNumber}", "${b.incidentType}", "${b.status}", "${b.filedAt.toISOString()}", "${b.complainant.firstName} ${b.complainant.lastName}", "${b.respondent.firstName} ${b.respondent.lastName}"`
    )
    return headers.concat(rows).join('\n')
  }

  throw new Error('Invalid export type')
}
