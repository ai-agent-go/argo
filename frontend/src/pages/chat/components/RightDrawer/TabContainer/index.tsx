import {useAtomValue} from 'jotai'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {activeChat} from '~/lib/stores'

import Knowledge from '../../Knowledge'
import Plugins from '../../Plugins'
import Variables from '../../Variables'

const Tabs = [
  {value: 0, label: 'Variable'},
  {value: 1, label: 'Knowledge'},
  {value: 2, label: 'Plugins'},
]
function TabContainer({refreshBot}) {
  const {t} = useTranslation()
  const $activeBot = useAtomValue(activeChat)
  const [activeTab, setActiveTab] = useState(undefined)
  const getInitActiveTab = () => {
    if ($activeBot?.detail?.model_config?.user_input_form?.length > 0) {
      setActiveTab(0)
    } else if ($activeBot?.hasKnowledge) {
      setActiveTab(1)
    }
    if ($activeBot?.detail?.category === 'roleplay') {
      setActiveTab(2)
    }
  }
  useEffect(() => {
    if ($activeBot.bot_id && activeTab === undefined) {
      getInitActiveTab()
    }
  }, [$activeBot])
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0 px-6">
        {Tabs.filter((tab) => {
          if (
            tab.value === 0 &&
            $activeBot?.detail?.model_config?.user_input_form?.length > 0
          ) {
            return true
          }
          if (tab.value === 1 && $activeBot?.hasKnowledge) {
            return true
          }
          if (tab.value === 2 && $activeBot?.detail?.category === 'roleplay') {
            return true
          }
          return false
        }).map((tab) => (
          <div
            className={`px-7 py-2 rounded-[40px] border-[1px] cursor-pointer border-solid bg-white ${activeTab === tab.value ? 'font-600 text-[#03060E] text-[10px] border-[#000000]' : 'border-[#EBEBEB] text-[#565759] text-[10px] font-500'}`}
            key={tab.value}
            onClick={() => {
              if (activeTab !== tab.value) {
                setActiveTab(tab.value)
              }
            }}
          >
            {t(tab.label)}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 0 ? (
          <Variables
          // refreshBot={refreshBot}
          // values={$activeChat?.inputs || {}}
          // formList={configs.user_input_form || []}
          // onChange={handleChangeVariable}
          />
        ) : null}
        {activeTab === 1 ? <Knowledge refreshBot={refreshBot} /> : null}
        {activeTab === 2 ? <Plugins /> : null}
      </div>
    </div>
  )
}

export default TabContainer
