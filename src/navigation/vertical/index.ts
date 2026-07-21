// ** Icon imports
import Login from 'mdi-material-ui/Login'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import AccountGroupOutline from 'mdi-material-ui/AccountGroupOutline'
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline'
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

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
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
      icon: FileDocumentOutline, // Reusing icon for now
      path: '/documents/release-log'
    },
    {
      title: 'Blotter Records',
      icon: LockOutline,
      path: '/blotter'
    },
    {
      title: 'Announcements',
      icon: BullhornOutline,
      path: '/announcements'
    },
    {
      title: 'Analytics & Reports',
      icon: ChartPie,
      path: '/analytics'
    },
    {
      title: 'Finance Mgmt',
      icon: Finance,
      path: '/finance'
    },
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
    {
      sectionTitle: 'Admin Settings'
    },
    {
      title: 'User Roles',
      icon: ShieldAccountOutline,
      path: '/admin/users'
    },
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
    {
      title: 'Backup & Restore',
      icon: DatabaseExportOutline,
      path: '/admin/backup'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline,
      path: '/account-settings'
    },
    {
      sectionTitle: 'Auth Pages'
    },
    {
      title: 'Login',
      icon: Login,
      path: '/pages/login',
      openInNewTab: false
    },
    {
      title: 'Register',
      icon: AccountPlusOutline,
      path: '/pages/register',
      openInNewTab: false
    },
    {
      title: 'Error',
      icon: AlertCircleOutline,
      path: '/pages/error',
      openInNewTab: true
    }
  ]
}

export default navigation
