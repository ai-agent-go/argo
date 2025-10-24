import AboutIcon from '../icons/AboutIcon'
import DataFileIcon from '../icons/DataFile'
import LanguageIcon from '../icons/LanguageIcon'
import MemberIcon from '../icons/MemberIcon'
import About from './components/About'
import DataFile from './components/DataFile'
import Language from './components/Language'
import Members from './components/Members'

export const SettingMenus = [
  {
    text: 'ACCOUNT',
    children: [
      {
        value: 'members',
        text: 'Members',
        icon: MemberIcon,
        comp: () => <Members />,
      },
      {
        value: 'language',
        text: 'Language',
        icon: LanguageIcon,
        comp: () => <Language />,
      },
      {
        value: 'Data file',
        text: 'Data file',
        icon: DataFileIcon,
        comp: () => <DataFile />,
      },
      {
        value: 'About Us',
        text: 'About Us',
        icon: AboutIcon,
        comp: () => <About />,
      },
    ],
  },
]

export const MemberTypes = {normal: 'Normal User', admin: 'Admin User'}
