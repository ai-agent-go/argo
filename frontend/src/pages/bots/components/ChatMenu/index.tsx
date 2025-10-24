import {Dropdown, Menu, Tooltip} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

import GarbageBin from '~/components/icons/GarbageBin'
// import Pencil from '~/components/icons/Pencil'

function ChatMenu({children, deleteHandler}) {
  const {t} = useTranslation()
  const renderDropdown = (
    <div slot="content">
      <Menu className="w-full max-w-[180px] rounded-xl  border border-gray-300/30  z-50 bg-white shadow">
        {/* <Menu.Item
          key="rename"
          className="flex gap-2 items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
          onClick={() => {
            renameHandler()
          }}
        >
          <Pencil strokeWidth="2" />
          <div className="flex items-center">{t('Rename')}</div>
        </Menu.Item> */}
        <Menu.Item
          key="delete"
          className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50"
          onClick={() => {
            deleteHandler()
          }}
        >
          <GarbageBin strokeWidth="2" />
          <div className="flex items-center">{t('Delete')}</div>
        </Menu.Item>
      </Menu>
    </div>
  )
  return (
    <div>
      <Dropdown trigger="click" droplist={renderDropdown}>
        <Tooltip content={t('More')}>{children}</Tooltip>
      </Dropdown>
    </div>
  )
}

export default ChatMenu
