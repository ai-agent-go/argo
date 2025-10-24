import {Dropdown, Menu, Tooltip} from '@arco-design/web-react'
import {IconSettings} from '@arco-design/web-react/icon'
import {useTranslation} from 'react-i18next'

import GarbageBin from '~/components/icons/GarbageBin'

function ModelMenu({children, deleteHandler, settingHandler}) {
  const {t} = useTranslation()

  const dropList = (
    <Menu className="w-full max-w-[160px] rounded-xl px-1 py-1.5 border border-gray-300/30  z-50 bg-white shadow">
      <Menu.Item
        key="delete"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={() => {
          deleteHandler()
        }}
      >
        <GarbageBin strokeWidth="2" />
        <div className="flex items-center">{t('Delete')}</div>
      </Menu.Item>
      <Menu.Item
        key="setting"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={() => {
          settingHandler()
        }}
      >
        <IconSettings className="font-500" />
        <div className="flex items-center">{t('Setting')}</div>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown trigger="click" droplist={dropList} position="bottom">
      <Tooltip content={t('More')}>{children}</Tooltip>
    </Dropdown>
  )
}

export default ModelMenu
