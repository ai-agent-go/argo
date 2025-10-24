import {Dropdown, Menu, Tooltip} from '@arco-design/web-react'
import {IconDownload, IconShareExternal} from '@arco-design/web-react/icon'
import React from 'react'
import {useTranslation} from 'react-i18next'

import EditIcon from '~/components/icons/EditIcon'
import GarbageBin from '~/components/icons/GarbageBin'

function MoreMenu({
  children,
  deleteHandler,
  editHandler,
  shareHandler,
  handleDownload,
}) {
  const {t} = useTranslation()

  const dropList = (
    <Menu className="w-full max-w-[160px] rounded-xl px-1 py-1.5 border border-gray-300/30  z-50 bg-white shadow">
      <Menu.Item
        key="edit"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={(e) => {
          e.stopPropagation()
          editHandler()
        }}
      >
        <EditIcon />
        <div className="flex items-center">{t('Edit')}</div>
      </Menu.Item>
      <Menu.Item
        key="download"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={(e) => {
          e.stopPropagation()
          handleDownload()
        }}
      >
        <IconDownload />
        <div className="flex items-center">{t('Export')}</div>
      </Menu.Item>
      <Menu.Item
        key="share"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={(e) => {
          e.stopPropagation()
          shareHandler()
        }}
      >
        <IconShareExternal />
        <div className="flex items-center">{t('Share')}</div>
      </Menu.Item>
      <Menu.Item
        key="delete"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={(e) => {
          e.stopPropagation()
          deleteHandler()
        }}
      >
        <GarbageBin strokeWidth="2" />
        <div className="flex items-center">{t('Delete')}</div>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown trigger="click" droplist={dropList} position="bottom">
      <Tooltip content={t('More')}>{children}</Tooltip>
    </Dropdown>
  )
}

export default MoreMenu
