import {Tooltip} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import {memo, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Link, useLocation} from 'react-router-dom'

import SidebarClose from '~/components/icons/SidebarClose'
import {activeChat, currentWorkspace} from '~/lib/stores'

import {MenuRoute} from '../../menuConfig'
import ChatList from '../ChatList'

const BotLeft = memo(() => {
  const {pathname} = useLocation()
  const {t} = useTranslation()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [, setActiveChat] = useAtom(activeChat)
  const [visibleMenu, setVisibleMenu] = useState<any>(
    localStorage.botMenuVisible !== undefined
      ? Boolean(localStorage.botMenuVisible)
      : true
  )

  const storageChange = (e) => {
    if (e.key === 'botMenuVisible') {
      setVisibleMenu(Boolean(localStorage.botMenuVisible))
    }
  }

  useEffect(() => {
    window.addEventListener('storage', storageChange)
    return () => {
      window.removeEventListener('storage', storageChange)
    }
  })

  return (
    <div
      className={`bg-[#F9F9F9] flex flex-col flex-shrink-0 h-full overflow-hidden ${visibleMenu ? 'w-[250px]' : 'w-[74px]'} px-4`}
    >
      <div
        onClick={() => {
          localStorage.setItem('botMenuVisible', !visibleMenu ? '1' : '')
          setVisibleMenu((pre) => !pre)
        }}
        className={`cursor-pointer w-6 h-6 my-7 ${visibleMenu ? 'ml-3' : 'mx-auto'}`}
      >
        <SidebarClose />
      </div>
      {MenuRoute.map((item) => (
        <Link
          key={item.name}
          to={item.path($currentWorkspace.id)}
          onClick={() => {
            setActiveChat({})
          }}
          className={`${item.path($currentWorkspace.id) === pathname ? 'bg-[#EBEBEB] font-600' : 'hover:bg-[#EBEBEB]'} cursor-pointer rounded-[8px] flex items-center px-[10px] py-[6px] mb-[10px] text-[#03060E] text-[14px]`}
        >
          <Tooltip position="right" content={visibleMenu ? '' : t(item.name)}>
            <img
              src={item.icon}
              alt=""
              className={`w-6 h-6 ${visibleMenu ? 'mr-[10px]' : 'mx-auto my-1'}`}
            />
          </Tooltip>
          {visibleMenu ? (
            <span className="transition-all duration-150 truncate">
              {t(item.name)}
            </span>
          ) : (
            ''
          )}
        </Link>
      ))}
      <div className="h-[0.5px] bg-[#EBEBEB] w-full my-[10px]" />
      {visibleMenu ? (
        <div
          className={`text-[#03060E] text-[14px] font-700 leading-[17px] truncate p-3 ${visibleMenu ? 'w-full' : 'w-0'} transition-all`}
        >
          {t('Chat History')}
        </div>
      ) : (
        ''
      )}
      <ChatList visibleMenu={visibleMenu} />
    </div>
  )
})

export default BotLeft
