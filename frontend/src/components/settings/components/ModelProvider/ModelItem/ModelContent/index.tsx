import {Message} from '@arco-design/web-react'
import {useAtomValue} from 'jotai'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'

import GarbageBin from '~/components/icons/GarbageBin'
import MoreIcon from '~/components/icons/MoreIcon'
import {addModelInProviders, deleteModelInProviders} from '~/lib/apis/settings'
import {currentWorkspace} from '~/lib/stores'

import AddModelInProvider from '../AddModelInProvider'

function ModelContent({credentials, provider, refresh}) {
  const {t} = useTranslation()
  const $currentWorkspace = useAtomValue(currentWorkspace)
  const canAddModal = provider !== 'ollama'
  const [visible, setVisible] = useState(false)
  const [modelVisible, setModelVisible] = useState(false)

  const handleSubmit = async (v) => {
    await addModelInProviders($currentWorkspace.id, {
      custom_name: credentials.custom_name,
      provider,
      ...v,
    })
    Message.success(t('Add Success'))
    refresh()
    setModelVisible(false)
  }

  const handleDelete = async (item) => {
    await deleteModelInProviders($currentWorkspace.id, {
      provider,
      custom_name: credentials.custom_name,
      model: item.model,
    })
    Message.success(t('Delete Success'))
    setModelVisible(false)
    if (credentials.support_chat_models.length <= 1) {
      setVisible(false)
    }
    refresh()
  }
  return (
    <div
      className="overflow-hidden"
      style={{
        background: `linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), linear-gradient(0deg, ${credentials.color}, ${credentials.color})`,
      }}
    >
      <div
        className={`${visible ? 'rounded-[8px] px-[14px] m-[14px] bg-white border-[1px] border-[#EBEBEB]' : ''}`}
      >
        <div className="flex justify-between items-center">
          <div
            className="p-[14px] flex items-center "
            onClick={() => {
              if (credentials.support_chat_models.length > 0) {
                setVisible((pre) => !pre)
              }
            }}
          >
            {credentials.support_chat_models.length} Models
            <MoreIcon
              className={`w-[14px] h-[14px] ml-[4px] ${visible ? 'rotate-180' : 'rotate-0'}`}
            />
          </div>
          {canAddModal ? (
            <div
              className="text-[14px] text-[#133EBF] cursor-pointer flex mr-[14px] items-center"
              onClick={() => {
                setModelVisible(true)
              }}
            >
              <div className="bg-[url('~/assets/icon_plus.png')] bg-contain w-4 h-4 mr-[4px]" />
              {t('Adding Models')}
            </div>
          ) : null}
        </div>
        {visible ? (
          <div className="border-t-[1px] border-[#EBEBEB] py-3">
            {credentials.support_chat_models.map((item) => (
              <div className="flex items-center mb-[14px]" key={item.model}>
                <div className="w-[18px] h-[18px] mr-2 rounded-[4px]">
                  <img src={credentials.icon_url} alt="" />
                </div>
                <div className="text-[14px] text-[#03060E] mr-[4px]">
                  {item.model}
                </div>
                {item.tags?.map((v) => (
                  <div
                    key={v}
                    className="border-[1px] mr-[4px] border-[#EBEBEB] rounded-[4px] px-[6px] py-[2px] text-[#8B8B8C] text-[10px] leading-[14px]"
                  >
                    {v}
                  </div>
                ))}
                {canAddModal && item.custom ? (
                  <div
                    className="ml-auto "
                    onClick={() => {
                      handleDelete(item)
                    }}
                  >
                    <GarbageBin className="w-4 h-4" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <AddModelInProvider
          onClose={() => {
            setModelVisible(false)
          }}
          visible={modelVisible}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default ModelContent
