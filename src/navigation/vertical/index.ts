// ** Icon imports
import Login from 'mdi-material-ui/Login'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import AccountGroupOutline from 'mdi-material-ui/AccountGroupOutline'
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline'
import ClipboardCheckOutline from 'mdi-material-ui/ClipboardCheckOutline'
import LockOutline from 'mdi-material-ui/LockOutline'
import BullhornOutline from 'mdi-material-ui/BullhornOutline'
import ChartPie from 'mdi-material-ui/ChartPie'
import Finance from 'mdi-material-ui/Finance'
import ScaleBalance from 'mdi-material-ui/ScaleBalance'
import AccountTieOutline from 'mdi-material-ui/AccountTieOutline'
import ShieldAccountOutline from 'mdi-material-ui/ShieldAccountOutline'
import History from 'mdi-material-ui/History'
import CogOutline from 'mdi-material-ui/CogOutline'
import FileCodeOutline from 'mdi-material-ui/FileCodeOutline'
import DatabaseExportOutline from 'mdi-material-ui/DatabaseExportOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

// Role-based access matrix
// SUPER_ADMIN: everything
// ADMIN: everything except Backup & Restore, User Roles (SUPER_ADMIN only)
// STAFF: Residents, Documents, Blotter, Announcements, Officials, Transparency, Dashboard, Account Settings
// OFFICIAL: Dashboard, Announcements, Officials, Transparency, Account Settings
// RESIDENT: Dashboard, Announcements, Transparency, Officials, Account Settings

const navigation = (role: string = 'RESIDENT'): VerticalNavItemsType => {
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isAdmin = role === 'ADMIN' || isSuperAdmin
  const isStaff = role === 'STAFF' || isAdmin
  const isOfficial = role === 'OFFICIAL' || isStaff
  // All roles get these base items

  const items: VerticalNavItemsType = [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
  ]

  // Staff and above
  if (isStaff) {
    items.push(
      {
        title: 'Residents',
        icon: AccountGroupOutline,
        path: '/residents'
      },
      {
        title: 'Document Requests',
        icon: FileDocumentOutline,
        path: '/documents'
      },
      {
        title: 'Release Log',
        icon: ClipboardCheckOutline,
        path: '/documents/release-log'
      },
      {
        title: 'Blotter Records',
        icon: LockOutline,
        path: '/blotter'
      },
    )
  }

  // Official and above
  if (isOfficial) {
    items.push(
      {
        title: 'Announcements',
        icon: BullhornOutline,
        path: '/announcements'
      },
    )
  }

  // Staff and above get Analytics
  if (isStaff) {
    items.push(
      {
        title: 'Analytics & Reports',
        icon: ChartPie,
        path: '/analytics'
      },
    )
  }

  // Admin and above get Finance Management
  if (isAdmin) {
    items.push(
      {
        title: 'Finance Mgmt',
        icon: Finance,
        path: '/finance'
      },
    )
  }

  // All roles can see Transparency Board (public info) and Officials
  items.push(
    {
      title: 'Transparency Board',
      icon: ScaleBalance,
      path: '/transparency'
    },
    {
      title: 'Barangay Officials',
      icon: AccountTieOutline,
      path: '/officials'
    },
  )

  // Admin Settings section — Admin and above
  if (isAdmin) {
    items.push({ sectionTitle: 'Admin Settings' } as any)

    if (isSuperAdmin) {
      items.push({
        title: 'User Roles',
        icon: ShieldAccountOutline,
        path: '/admin/users'
      })
    }

    items.push(
      {
        title: 'Audit Logs',
        icon: History,
        path: '/admin/audit-logs'
      },
      {
        title: 'System Settings',
        icon: CogOutline,
        path: '/admin/settings'
      },
      {
        title: 'Doc Templates',
        icon: FileCodeOutline,
        path: '/admin/templates'
      },
    )

    if (isSuperAdmin) {
      items.push({
        title: 'Backup & Restore',
        icon: DatabaseExportOutline,
        path: '/admin/backup'
      })
    }
  }

  // Account Settings — all roles
  items.push({
    title: 'Account Settings',
    icon: AccountCogOutline,
    path: '/account-settings'
  })

  return items
}

export default navigation
