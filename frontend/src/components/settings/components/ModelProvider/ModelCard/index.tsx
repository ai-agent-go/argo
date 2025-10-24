import {Message} from '@arco-design/web-react'
import {useAtomValue} from 'jotai'
import React, {useState} from 'react'

import {updateModelProviders} from '~/lib/apis/settings'
import {currentWorkspace} from '~/lib/stores'

import CreateCustomModel from './CreateCustomModel'
import CreateModel from './CreateModel'

function ModelCard({provider, credentials, refresh}) {
  const $currentWorkspace = useAtomValue(currentWorkspace)
  const [customVisible, setCustomVisible] = useState(false)
  const [visible, setVisible] = useState(false)

  const handleSubmit = async (v) => {
    try {
      await updateModelProviders($currentWorkspace.id, {
        credentials: v,
        provider,
      })
      Message.success('Set Success')
      refresh()
      setCustomVisible(false)
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }
  const handleSetModel = () => {
    if (provider === 'openai-api-compatible') {
      setCustomVisible(true)
    } else {
      setVisible(true)
    }
  }
  return (
    <div>
      <div
        className="p-3 rounded-[8px] cursor-pointer"
        style={{background: credentials.color || '#E5E7EB'}}
        onClick={handleSetModel}
      >
        <div className="flex items-center mb-[6px]">
          <div className="h-6 mr-[6px]">
            <img src={credentials?.icon_url} alt="" className="w-auto h-full" />
          </div>
          <div className="text-[16px] text-[#03060E] font-600 truncate">
            {provider}
          </div>
        </div>
        <div className="text-[#565759] text-[12px] leading-4 h-8 line-clamp-2">
          {credentials.description}
        </div>
        <div className="flex items-center h-[18px] mt-[21px]" />
      </div>
      {customVisible ? (
        <CreateCustomModel
          visible={customVisible}
          onClose={() => {
            setCustomVisible(false)
          }}
          credentials={credentials}
          onSubmit={handleSubmit}
        />
      ) : null}
      {visible ? (
        <CreateModel
          visible={visible}
          onClose={() => {
            setVisible(false)
          }}
          credentials={credentials}
          linkUrl={credentials.link_url}
          linkMsg={credentials.link_msg}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  )
}

export default ModelCard
