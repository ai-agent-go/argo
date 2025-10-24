/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Message} from '@arco-design/web-react'
import {IconLoading} from '@arco-design/web-react/icon'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import React, {useEffect, useRef, useState} from 'react'

import MarkdownText from '~/components/MarkdownText'
import {openPlan, planMsg} from '~/lib/stores'

import {checkInterruptOptions} from '../../utils'
import EditMessage from '../EditMessage'
import ExtraMessage from '../ExtraMessage'
import TaskItem from './taskItem'

function ResponseMessage({
  message,
  sending = false,
  isEdit = false,
  changeIsEdit = (_: any) => {},
  handleEditConfirm = (_) => {},
  detail,
  loading = false,
  nameColor = '#AEAFB3',
  handleClickExtraItem = (_) => {},
  interruptEvent = null,
  taskContent = '',
  handleSubmit = (_) => {},
  setInterruptEvent = (_) => {},
}) {
  const cursorRef = useRef(null)
  const cursorInterval = useRef(null)
  const [isPlan, setIsPlan] = useState(null)
  const [$planMsg, setPlanMsg] = useAtom(planMsg)
  const [$openPlan, setOpenPlan] = useAtom(openPlan)

  useEffect(() => {
    if (loading && cursorRef.current && !sending) {
      cursorInterval.current = setInterval(() => {
        if (!cursorRef.current) {
          clearInterval(cursorInterval.current)
        }
        if (cursorRef.current) {
          cursorRef.current.style.visibility =
            cursorRef.current.style.visibility === 'hidden'
              ? 'visible'
              : 'hidden'
        }
      }, 500) // 切换光标可见性的时间间隔
    }
    return () => {
      if (loading) {
        clearInterval(cursorInterval.current)
      }
    }
  }, [sending])

  const processedValue = (text) => {
    if (!text) return text
    // if (text.indexOf('<think>') > -1 && text.indexOf('</think>') < 0) {
    //   text += '</think>'
    // }
    return text
      ?.replace(/~/g, '\\~')
      ?.replace(/\\\(/g, '$') // 转换 \(...\) 为 $...$
      ?.replace(/\\\)/g, '$')
      ?.replace(/\\\[/g, '$$') // 转换 \[...\] 为 $$...$$
      ?.replace(/\\\]/g, '$$')
    // ?.replace(/<think>([\s\S]*?)<\/think>/gi, (_, content) => {
    //   const lines = content
    //     .trim()
    //     .split('\n')
    //     .map((line: string) => (line ? `> ${line}` : '>'))
    //     .join('\n')
    //   return lines
    // })
  }

  const handleInterruptOption = async (optionValue, text) => {
    try {
      if (optionValue === 'edit_plan') {
        // 处理编辑计划的逻辑 - 触发Edit plan模式
        if (handleSubmit) {
          // 通过handleSubmit传递Edit plan模式信号
          handleSubmit({message: '', filelist: [], editPlanText: text})
        }
        // Edit plan模式下不立即清除interrupt选项，等消息发送后再清除
      } else if (optionValue === 'accepted') {
        // 处理开始研究的逻辑 - 发送新用户消息
        if (handleSubmit) {
          handleSubmit({
            message: `[${text}]`,
            filelist: [],
          })
        }
        // 清除interrupt选项
        setInterruptEvent(null)
      }
    } catch (error) {
      console.error('Error handling interrupt option:', error)
    }
  }

  const show = () => {
    if (!interruptEvent) return null
    const options = checkInterruptOptions(taskContent)
    if (options && options.length > 0) {
      return (
        <div
          id="interruptOptionsID"
          className="flex absolute p-[4px] items-center gap-[6px] bottom-0 right-5 bg-gray-50 rounded-[8px] shadow-sm border border-gray-200"
        >
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleInterruptOption(option.value, option.text)}
              className="shrink-0 h-[32px] px-3 cursor-pointer flex items-center text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 border border-gray-300 hover:border-blue-300 rounded-md transition-all duration-200 shadow-sm"
            >
              {option.text}
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const reportGeneration = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>

          <span className="text-gray-600 font-medium">
            {t('Report generation in progress...')}
          </span>
        </div>
      )
    }
    return null
  }

  const renderCard = () => {
    const researcher = message.agent_thoughts.filter((item) =>
      item?.metadata?.langgraph_node?.includes('researcher')
    )
    const report = message.agent_thoughts.find((item) =>
      item?.metadata?.langgraph_node?.includes('reporter')
    )
    return (
      <div className=" py-[10px] px-[20px] rounded-tl-[4px] rounded-tr-[23px] rounded-bl-[23px] rounded-br-[23px] bg-[#F2F2F2E5] rounded-lg">
        <TaskItem message={isPlan?.thought} />
        {(researcher && researcher.length) || report ? (
          <div className="max-w-2xl mx-auto mt-4 flex items-center justify-between px-2 py-3 bg-gray-50 rounded-lg border border-gray-200">
            {reportGeneration()}
            <button
              onClick={() => {
                setPlanMsg(message)
                setOpenPlan(true)
              }}
              className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
            >
              {t('View report')}
            </button>
          </div>
        ) : null}
        {loading ? <span ref={cursorRef}>|</span> : null}
      </div>
    )
  }

  useEffect(() => {
    if (message.agent_thoughts) {
      const plan = [...message.agent_thoughts].reverse().find((item) => {
        if (!item?.metadata?.langgraph_node?.includes('planner')) return false
        try {
          JSON.parse(item.thought)
          return true
        } catch {
          return false
        }
      })

      const reporter = message.agent_thoughts.find((item) =>
        item?.metadata?.langgraph_node?.includes('reporter')
      )
      const researcher = message.agent_thoughts.find((item) =>
        item?.metadata?.langgraph_node?.includes('researcher')
      )

      if (plan) {
        setIsPlan(plan)
      }

      if (loading) {
        setPlanMsg(message)
        if (reporter || researcher) {
          setOpenPlan(true)
        }
      }
    }
  }, [message])

  const renderMsg = () => {
    if (isPlan) {
      return renderCard()
    }
    if (!isEdit) {
      return (
        <div className="flex space-x-2 py-[10px] px-[20px] rounded-tl-[4px] rounded-tr-[23px] rounded-bl-[23px] rounded-br-[23px] bg-[#F2F2F2E5] font-600 rounded-lg">
          <div className=" w-full text-16 leading-[26px] text-[#03060E] font-400">
            {message.sending ? (
              <IconLoading />
            ) : (
              <div id={message.id}>
                {message.agent_thoughts?.map((v) => (
                  <div key={v.id} id={v.id}>
                    <MarkdownText
                      message={v?.thought || ''}
                      isSending={loading}
                    />
                    {v.tool_type ? (
                      <ExtraMessage
                        info={v}
                        handleClick={() => handleClickExtraItem(v)}
                      />
                    ) : null}
                  </div>
                ))}
                {!message.agent_thoughts ||
                message.agent_thoughts.length === 0 ? (
                  <MarkdownText
                    message={message.answer || ''}
                    isSending={loading}
                  />
                ) : null}
                {loading ? <span ref={cursorRef}>|</span> : null}
              </div>
            )}
          </div>
        </div>
      )
    }
    return (
      <EditMessage
        msg={
          message?.agent_thoughts?.filter((v) => !v.tool_type)?.[0]?.thought ||
          message?.answer
        }
        handleCancel={() => {
          changeIsEdit(false)
        }}
        handleSubmit={handleEditConfirm}
      />
    )
  }

  return (
    <div className="flex w-full">
      <div className="flex-shrink-0 mr-3">
        <img
          src={detail.icon}
          alt=""
          className="size-8 object-cover rounded-full -translate-y-[1px]"
        />
      </div>
      <div className="w-full overflow-hidden pl-1">
        <div
          className={`self-center line-clamp-1 contents text-[${nameColor}] text-14`}
        >
          {detail.name}
        </div>
        <div className="prose w-full max-w-full">
          <div className="w-full">{renderMsg()}</div>
          {interruptEvent &&
          interruptEvent?.message_id ===
            message?.agent_thoughts?.[0]?.message_id
            ? show()
            : null}
        </div>
      </div>
    </div>
  )
}

export default ResponseMessage
