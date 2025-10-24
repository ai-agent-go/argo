import {useAtom} from 'jotai'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory, useLocation} from 'react-router-dom'

import Settings from '~/components/settings'
import {menus} from '~/layout/menuConfig'
import {currentWorkspace} from '~/lib/stores'

import SettingIcon from '../../assets/ic_set.svg'
import LOGO from '../../assets/left_logo.png'
import InviteItem from '../InviteItem'
import UserMenu from './UserMenu'

function Sidebar() {
  const {t} = useTranslation()
  const history = useHistory()
  const {pathname} = useLocation()
  const [$currentWorkspace] = useAtom(currentWorkspace)

  const [showDropList, setShowDropList] = useState(false)
  const [showSetting, setShowSetting] = useState(false)

  useEffect(() => {
    window.addEventListener('click', () => {
      setShowDropList(false)
    })
  }, [])

  return (
    <div className="w-[70px] flex flex-col items-center">
      <img src={LOGO} alt="argo logo" className="w-[50px] h-[80px]" />
      {menus({spaceId: $currentWorkspace?.id})?.map((item) => {
        let isActive = pathname.includes(item.name.toLocaleLowerCase())
        if (item.children) {
          isActive =
            item.children.findIndex((v) =>
              pathname.includes(v.path.toLocaleLowerCase())
            ) > -1
        }
        return (
          <div
            key={item.path}
            className={`box-border ${isActive ? 'text-[#03060E]' : 'text-[#565759]'}`}
          >
            <div
              className="flex items-center"
              onClick={() => {
                history.replace(item.path)
              }}
            >
              <div className="w-[50px] flex flex-col items-center mb-5">
                <img
                  src={item.icon}
                  alt=""
                  className={isActive ? 'bg-white rounded-[10px]' : ''}
                />
                <span className="mt-[5px] text-center text-nowrap text-[11px] flex-shrink-0">
                  {t(item.name)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="flex flex-col flex-1 justify-end">
        {localStorage.getItem('enableMultiUser') === 'true' ? (
          <UserMenu>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDropList((pre) => !pre)
              }}
              aria-label="self"
              className={`flex rounded-xl py-3 px-3.5 w-full hover:bg-gray-100 dark:hover:bg-gray-900 transition hover:text-[#133ebf] ${showDropList ? 'text-[#133ebf]' : ''}`}
            >
              <div className="self-center font-500 text-[18px]">
                {localStorage?.email?.split('@')?.[0][0]}
              </div>
            </button>
          </UserMenu>
        ) : (
          <button
            aria-label="self"
            className=" flex rounded-xl  w-full hover:bg-gray-100 transition justify-center"
            onClick={() => {
              setShowSetting(true)
            }}
          >
            <img src={SettingIcon} alt="" className="w-[30px] h-[30px]" />
          </button>
        )}
      </div>
      <div className="w-[30px] h-[0.5px] mx-auto my-[14px] bg-[#AEAFB3]" />
      <div className="mb-[10px]">
        <InviteItem />
      </div>
      <Settings
        visible={showSetting}
        onClose={() => {
          setShowSetting(false)
        }}
      />
    </div>
  )
}

export default Sidebar
