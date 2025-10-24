import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import IconArrow from '~/assets/ic_arrow.svg'
import IconKnowledge from '~/assets/ic_knowledge.svg'
import IconTool from '~/assets/ic_tool.svg'
import OverflowTooltip from '~/components/OverflowTooltip'

const TOOL_RESULT_TYPES = {
  error: 'Execution failed',
  tool_started: 'In progress',
  success: 'Execution succeeded',
}

function ExtraMessage({info, handleClick}) {
  const {t} = useTranslation()
  const [status, setStatus] = useState(info.status)

  const getStatus = () => {
    if (info.status === 'tool_started') {
      setStatus('tool_started')
    } else if (info.status === 'tool_end') {
      const {error} = info.metadata ?? {}
      if (error) {
        setStatus('error')
      } else {
        setStatus('success')
      }
    } else {
      setStatus('success')
    }
  }

  useEffect(() => {
    getStatus()
  }, [info.status])

  if (info.tool_type === 'dataset') {
    return (
      <div
        onClick={() => {
          if (status !== 'tool_started') {
            handleClick()
          }
        }}
        className={`flex ${status !== 'tool_started' ? 'cursor-pointer' : 'cursor-not-allowed'} mb-[10px] max-w-full overflow-hidden items-center rounded-[8px] w-max px-3 py-[9px] box-border bg-white border-[0.5px] border-[#ebebeb] text-[14px]`}
      >
        <img src={IconKnowledge} alt="" className="mr-1 w-5 h-5" />
        <span className=" flex-shrink-0 text-nowrap">
          {t('Knowledge')} ·{' '}
        </span>{' '}
        <OverflowTooltip>{info?.metadata?.knowledge_name}</OverflowTooltip>
        <div className="mx-1 flex-shrink-0 text-nowrap">
          {' '}
          ·{' '}
          {t('find knowledge ad references', {
            count: info?.metadata?.retriever_resources?.length || 0,
          })}
        </div>
        <img src={IconArrow} alt="" className="ml-1" />
      </div>
    )
  }
  return (
    <div
      onClick={() => {
        if (status !== 'tool_started') {
          handleClick()
        }
      }}
      className={`flex ${status !== 'tool_started' ? 'cursor-pointer' : 'cursor-not-allowed'} text-[14px] mb-[10px] max-w-full overflow-hidden items-center rounded-[8px] w-max px-3 py-[9px] box-border bg-white border-[0.5px] border-[#ebebeb]`}
    >
      <img src={IconTool} alt="" className="mr-1 w-5 h-5" />
      <span className=" flex-shrink-0 text-nowrap">{t('MCP Tool')} · </span>
      <OverflowTooltip>{info.tool}</OverflowTooltip>

      <div className="mx-1  flex-shrink-0 text-nowrap">
        {t(TOOL_RESULT_TYPES[status])}
      </div>
      <img src={IconArrow} alt="" className="ml-1" />
    </div>
  )
}

export default ExtraMessage
