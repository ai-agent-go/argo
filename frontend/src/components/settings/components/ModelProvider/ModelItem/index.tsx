import {Message} from '@arco-design/web-react'
import {useAtomValue} from 'jotai'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'

import SettingIcon from '~/components/icons/Settings'
import {deleteModelProviders, updateModelProviders} from '~/lib/apis/settings'
import {currentWorkspace} from '~/lib/stores'

import ModelContent from './ModelContent'
import ModelSetting from './ModelSetting'

function ModelItem({provider, credentials, refresh}) {
  const {t} = useTranslation()
  const $currentWorkspace = useAtomValue(currentWorkspace)

  const [visible, setVisible] = useState(false)

  const handleDelete = async () => {
    await deleteModelProviders($currentWorkspace.id, {
      provider,
    })
    Message.success(t('Delete Success'))
    setVisible(false)
    refresh()
  }

  const handleSubmit = async (v) => {
    try {
      await updateModelProviders($currentWorkspace.id, {
        credentials: {...credentials, ...v},
        provider,
      })
      Message.success('Set Success')
      refresh()
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  return (
    <div className="w-full rounded-[8px] border-[1px] border-[#EBEBEB] overflow-hidden shrink-0 mb-[14px]">
      <div
        className="px-[14px] py-5 border-b-[1px] border-[#EBEBEB]"
        style={{background: credentials.color || '#E5E7EB'}}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center mb-[6px]">
            <div className="h-6 mr-[6px]">
              <img
                src={credentials?.icon_url}
                alt=""
                className="w-auto h-full"
              />
            </div>
            <div className="text-[16px] text-[#03060E] font-600 truncate">
              {credentials.custom_name || provider}
            </div>
          </div>
          <div
            onClick={() => {
              setVisible(true)
            }}
            className="border-[0.5px] cursor-pointer border-[#EBEBEB] bg-[#fff] rounded-[6px] flex items-center py-[5px] px-[16px]"
          >
            <div className="w-[14px] h-[14px] mr-[2px]">
              <SettingIcon className="w-[14px] h-[14px]" />
            </div>
            {t('Setting')}
          </div>
        </div>
        <div className="flex items-center h-[18px] mt-[8px]" />
      </div>
      <ModelContent
        credentials={credentials}
        refresh={refresh}
        provider={provider}
      />
      <ModelSetting
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        credentials={credentials}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ModelItem
