import {Form} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory, useParams} from 'react-router-dom'

import AgentModal from '../../components/AgentModal'

function ConfigHeader({detail, changeDetail, modelList}) {
  const {t} = useTranslation()
  const history = useHistory()
  const {spaceId} = useParams<{spaceId: string}>()
  const [form] = Form.useForm()
  const [newChatDisabled, setNewChatDisabled] = useState(false)
  const [agentVisible, setAgentVisible] = useState(false)

  const handleNewChat = () => {
    if (!detail?.model_config?.model?.name) {
      return
    }
    history.replace(`/bots/${spaceId}/chat?botId=${detail.id}`)
  }

  useEffect(() => {
    if (detail?.model_config?.model?.name && modelList.length > 0) {
      const info = modelList.find(
        (v) => v.model_name === detail?.model_config?.model?.name
      )
      if (info?.model_name) {
        setNewChatDisabled(false)
      } else {
        setNewChatDisabled(true)
      }
    } else {
      setNewChatDisabled(true)
    }
  }, [detail, modelList])

  useEffect(() => {
    if (detail.model_config) {
      form.setFieldsValue({
        ...detail.model_config,
      })
    }
  }, [detail])

  return (
    <div className="flex items-center justify-between px-6 h-14">
      {/* <div className="flex items-center">
        <div
          className=" border-[0.5px] gap-1 w-[127px] rounded-lg flex items-center justify-center btn btn-default shrink-0 mr-6 !px-3 !h-8 !text-[13px] font-medium text-gray-700"
          onClick={() => {
            setAgentVisible(true)
          }}
        >
          <SettingIcon />
          {t('Bot Setting')}
        </div>
        <div className="flex items-center h-[14px] space-x-1 text-xs" />
      </div> */}

      <button
        disabled={newChatDisabled}
        onClick={handleNewChat}
        className={`px-2.5 h-8 py-1 gap-1 font-400 text-14 flex border-[0.5px] rounded-lg ${newChatDisabled && 'opacity-30'}`}
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
      <AgentModal
        visible={agentVisible}
        onClose={() => {
          setAgentVisible(false)
        }}
        detail={detail}
        setDetail={changeDetail}
      />
    </div>
  )
}

export default ConfigHeader
