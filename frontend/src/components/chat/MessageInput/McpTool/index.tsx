import {Modal, Tooltip} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {activeChat} from '~/lib/stores'

import IconTool from '../IconTool'
import ToolPopover from './ToolPopover'

const MCP_TOOL_TIPS = {
  [-1]: 'The current model does not support function call capability and cannot use tools. Please switch the tool model and use it.',
  0: 'The MCP tool is not enabled',
  1: 'MCP tools are enabled',
}

function ToolSelector({
  className,
  model,
  tools,
  enabled,
  changeTools,
  handleChangeDeepSearch,
}) {
  const {t} = useTranslation()
  const [tipType, setTipType] = useState<number>(0)
  const [$activeChat] = useAtom(activeChat)
  const [showModal, setShowModal] = useState(false)

  const checkTipType = () => {
    if (
      model &&
      model?.category &&
      (model?.category?.category_label.category.length === 0 ||
        model?.category?.category_label?.category?.findIndex(
          (item) => item.category === 'tools'
        ) === -1)
    ) {
      setTipType(-1)
    } else if (tools.length === 0 || !enabled) {
      setTipType(0)
    } else {
      setTipType(1)
    }
  }
  useEffect(() => {
    checkTipType()
  }, [model, tools])

  useEffect(() => {
    if (tipType === -1) {
      handleChangeDeepSearch('tool_call')
    }
  }, [tipType])

  return (
    <div className={className}>
      <Tooltip content={t('Deep Research')}>
        <div
          className={`border-[0.5px] flex items-center h-[30px] px-1 mr-1 rounded-md text-[12px] ${
            $activeChat?.agent_mode?.strategy === 'react_deep_research' ||
            $activeChat?.detail?.model_config?.agent_mode?.strategy ===
              'react_deep_research'
              ? 'border-[#9bafe4] bg-[#f2f6ff]'
              : 'bg-[#f2f2f2]'
          } ${tipType === -1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => {
            const el = document.querySelector('#interruptOptionsID')
            if (tipType === -1) {
              return
            }
            const strategy =
              $activeChat?.agent_mode?.strategy ||
              $activeChat?.detail?.model_config?.agent_mode?.strategy
            if (el && strategy === 'react_deep_research') {
              setShowModal(true)
              return
            }
            handleChangeDeepSearch(
              strategy === 'react_deep_research'
                ? 'tool_call'
                : 'react_deep_research'
            )
          }}
        >
          <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
          >
            <path
              d="M148.048193 604.53012l37.012048 67.855422 98.698795-55.518072-37.012048-67.855422-98.698795 55.518072zM493.493976 536.674699L419.46988 407.13253 259.084337 499.662651l74.024097 129.542168 160.385542-92.53012zM431.807229 357.783133l111.036144 191.228915 222.07229-129.542168-111.036145-191.228916-222.072289 129.542169zM734.072289 148.048193l-61.686747 37.012048 141.879518 252.915663 61.686747-37.012049-141.879518-252.915662zM530.506024 629.204819a92.16 92.16 0 0 0-21.466988-59.219277L350.689157 660.048193a93.270361 93.270361 0 0 0 31.768674 43.180723l-55.518072 172.722891h74.024096l49.349398-153.044819L499.662651 875.951807h74.024096l-61.686747-191.228915a92.036627 92.036627 0 0 0 18.506024-55.518073z"
              fill={
                $activeChat?.agent_mode?.strategy === 'react_deep_research' ||
                $activeChat?.detail?.model_config?.agent_mode?.strategy ===
                  'react_deep_research'
                  ? '#133EBF'
                  : '#AEAFB3'
              }
            />
          </svg>
          {t('Deep Research')}
        </div>
      </Tooltip>
      <ToolPopover
        tools={tools.filter((v) => v.type === 'mcp_tool')}
        changeTools={changeTools}
        disabled={tipType === -1}
      >
        <Tooltip content={t(MCP_TOOL_TIPS[tipType])}>
          <div>
            <IconTool
              className={`${tipType === -1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              fill={tipType === 1 ? '#F2F6FF' : '#F2F2F2'}
              stroke={tipType === 1 ? '#133EBF' : '#AEAFB3'}
            />
          </div>
        </Tooltip>
      </ToolPopover>

      <Modal
        visible={showModal}
        footer={null}
        unmountOnExit
        className="rounded-[12px] px-[6px] w-[500px]"
        closeIcon={false}
      >
        <div className="bg-white ">
          <div className="text-[#03060E] text-[18px] font-600 mb-2">
            {t('Confirm your action')}
          </div>
          <div className="text-[#565759] text-[12px]">
            {t(
              'A deep research task is currently in progress. Are you sure you want to turn off the deep research mode?'
            )}
          </div>
          <div className="flex items-center justify-end mt-5">
            <div
              className="bg-[#AEAFB34D] w-[79px] cursor-pointer text-[16px] text-[#03060E] text-center leading-[38px] mr-2 rounded-lg"
              onClick={() => {
                setShowModal(false)
              }}
            >
              {t('Cancel')}
            </div>
            <div
              className="bg-[#133EBF] w-[79px] cursor-pointer text-[16px] text-[#fff] text-center leading-[38px] rounded-lg"
              onClick={() => {
                setShowModal(false)
                const strategy =
                  $activeChat?.agent_mode?.strategy ||
                  $activeChat?.detail?.model_config?.agent_mode?.strategy
                handleChangeDeepSearch(
                  strategy === 'react_deep_research'
                    ? 'tool_call'
                    : 'react_deep_research'
                )
              }}
            >
              {t('OK')}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default React.memo(ToolSelector)
