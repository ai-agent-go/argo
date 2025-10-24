import {Dropdown, Menu, Tooltip} from '@arco-design/web-react'
import {useAtomValue} from 'jotai'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import EditIcon from '~/components/icons/EditIcon'
import {activeChat} from '~/lib/stores'

function MoreMenu({children, spaceId = ''}) {
  const $activeChat = useAtomValue(activeChat)
  const {t} = useTranslation()

  const dropList = (
    <Menu className="w-full max-w-[160px] rounded-xl px-1 py-1.5 border border-gray-300/30  z-50 bg-white shadow">
      <Menu.Item
        key="edit"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={(e) => {
          e.stopPropagation()
          window.location.href = `${
            window.location.origin
          }/space/${spaceId}/bot/${$activeChat.bot_id}`
        }}
      >
        <EditIcon />
        <div className="flex items-center">{t('Edit')}</div>
      </Menu.Item>
      <Menu.Item
        key="create"
        className="flex  gap-2  items-center px-3 py-2 text-sm  font-medium cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4.5H7.3125C5.7592 4.5 4.5 5.7592 4.5 7.3125V16.6875C4.5 18.2408 5.7592 19.5 7.3125 19.5H16.6875C18.2408 19.5 19.5 18.2408 19.5 16.6875V12"
            stroke="#565759"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16.8193 5.06066C17.4051 4.47487 18.3549 4.47487 18.9407 5.06066V5.06066C19.5265 5.64645 19.5265 6.59619 18.9407 7.18198L13.7208 12.4018C13.6659 12.4567 13.599 12.4981 13.5254 12.5226L11.4041 13.2297C11.0132 13.36 10.6413 12.9881 10.7716 12.5973L11.4787 10.4759C11.5033 10.4023 11.5446 10.3354 11.5995 10.2805L16.8193 5.06066Z"
            stroke="#565759"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Link to={`/bots/${spaceId}/chat?botId=${$activeChat.bot_id}`}>
          <div className="flex items-center">{t('New Chat')}</div>
        </Link>
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
