import {Modal} from '@arco-design/web-react'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {platForm} from '~/lib/utils'

import SettingRight from './components/Right'
import {SettingMenus} from './menus'

import './index.css'

function Settings({visible, onClose}) {
  const {t} = useTranslation()
  const [activeTab, setActiveTab] = useState(SettingMenus[0]?.children?.[1])

  useEffect(() => {
    setActiveTab(
      localStorage.getItem('enableMultiUser') === 'true'
        ? SettingMenus[0]?.children?.[0]
        : SettingMenus[0]?.children?.[1]
    )
  }, [])

  if (!visible) return null
  return (
    <div>
      <Modal
        className="modal w-[1000px] rounded-xl border-none"
        visible={visible}
        footer={null}
        maskClosable={false}
        unmountOnExit
      >
        <div className="flex">
          <div className="w-[200px] px-4 border border-gray-100 border-t-0 border-l-0 border-b-0 shrink-0 sm:shrink-1 flex flex-col items-center sm:items-start">
            <div className="my-[23px] ml-[10px] text-[#03060E] sm:text-base font-600 leading-4 text-[18px]">
              {t('Settings')}
            </div>
            <div className="w-full">
              {SettingMenus.map((menu) => (
                <div className="mb-4" key={menu.text}>
                  <div className="p-[10px] text-[10px] sm:text-xs font-600 text-[#9B9B9B]">
                    {t(menu.text)}
                  </div>
                  <div>
                    {menu.children
                      .filter((item) => {
                        if (
                          (platForm() === 'MacOS' &&
                            item.value === 'Data file') ||
                          (localStorage.getItem('enableMultiUser') !== 'true' &&
                            item.value === 'members')
                        ) {
                          return false
                        }
                        return true
                      })
                      .map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setActiveTab(item)
                          }}
                          className={`flex items-center h-[36px] mb-[2px] text-sm cursor-pointer rounded-lg font-light px-[10px] gap-[10px] ${
                            activeTab.value === item.value
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-700'
                          }`}
                        >
                          {item.icon({
                            color:
                              activeTab.value === item.value
                                ? '#133EBF'
                                : '#03060E',
                          })}
                          <div className="truncate">{t(item.text)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SettingRight activeTab={activeTab} onClose={onClose} />
        </div>
      </Modal>
    </div>
  )
}

export default Settings
