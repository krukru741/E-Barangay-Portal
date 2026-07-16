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
