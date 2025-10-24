import {Dropdown, Menu} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

import EditIcon from '~/components/icons/EditIcon'
import EllipsisHorizontal from '~/components/icons/EllipsisHorizontal'
import SidebarIcon from '~/components/SidebarIcon'

import SidebarClose from '../../../../components/icons/SidebarClose'

function NavBar({
  editHandler,
  icon,
  name,
  newChatDisable,
  newChat,
  showRightIcon = false,
  handleShowRight = () => {},
}) {
  const {t} = useTranslation()

  const dropList = (
    <Menu className="w-[140px] h-[52px] rounded-xl px-1 py-1.5 border border-gray-300/30 z-50 bg-white  shadow">
      <Menu.Item
        onClick={() => editHandler()}
        key="edit"
        className="flex  gap-2  items-center px-3 py-2 text-12 font-medium cursor-pointer hover:bg-gray-50 rounded-md"
      >
        <EditIcon />
        <div className="flex items-center">{t('Edit')}</div>
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="px-5 py-[18px] h-[60px] w-full flex justify-between text-[#03060e] border-b-[0.5px]">
      <div className="gap-2.5 flex items-center">
        <SidebarIcon />
        {icon && <img className="w-6 h-6" src={icon} alt="" />}
        <span className="font-500 text-base">{name}</span>
      </div>
      <div className="flex gap-6 justify-between items-center">
        <button
          disabled={newChatDisable}
          onClick={newChat}
          className={`px-2.5 h-8 py-1 gap-1 font-400 text-14 flex border-[0.5px] rounded-lg ${newChatDisable && 'opacity-30'}`}
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
          <span>{t('New Chat')}</span>
        </button>
        {showRightIcon ? (
          <div onClick={handleShowRight}>
            <SidebarClose />
          </div>
        ) : null}
        <Dropdown droplist={dropList} trigger="click" position="bl">
          <button
            onClick={(e) => {
              e.preventDefault()
            }}
            aria-label="icon"
            className="self-center w-fit text-sm hover:bg-black/5 rounded-xl"
          >
            <EllipsisHorizontal className="size-5 text-[#565759]" />
          </button>
        </Dropdown>
      </div>
    </div>
  )
}

export default NavBar
