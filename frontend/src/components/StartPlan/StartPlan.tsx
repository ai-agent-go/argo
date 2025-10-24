import {Message, Tooltip} from '@arco-design/web-react'
import {IconClose, IconCopy, IconDownload} from '@arco-design/web-react/icon'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import throttle from 'lodash/throttle'
import {useEffect, useRef, useState} from 'react'

import {openPlan, planMsg} from '~/lib/stores'
import {clipboard} from '~/utils/clipboard'

import ExtraMessage from '../chat/Messages/ExtraMessage'
import ExtraModal from '../chat/Messages/ExtraModal'
import MarkdownText from '../MarkdownText'

export default function StartPlan({
  loading,
  sending,
  handleClickExtraItem,
  visible,
  visibleExtra,
  extraInfo,
  setVisibleExtra,
  setExtraInfo,
}) {
  const cursorRef = useRef(null)
  const cursorInterval = useRef(null)
  const containerRef = useRef(null)
  const isUserScroll = useRef(false)
  const lastScrollTop = useRef(0)
  const [planMode, setPlanMode] = useState('activities')
  const enableChangePlan = useRef(true)

  const [$planMsg] = useAtom(planMsg)
  const [, setOpenPlan] = useAtom(openPlan)

  useEffect(() => {
    if ($planMsg.agent_thoughts) {
      if ($planMsg.reporterAnswer && enableChangePlan.current) {
        setPlanMode('report')
        enableChangePlan.current = false
      }
    }
  }, [$planMsg])

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

  const handleScroll = throttle(() => {
    if (containerRef.current) {
      const {scrollTop, scrollHeight, clientHeight} = containerRef.current
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 10

      const isScrollingUp = scrollTop < lastScrollTop.current
      const scrollDistance = lastScrollTop.current - scrollTop
      if (isScrollingUp && scrollDistance > 20) {
        isUserScroll.current = true
      } else if (isNearBottom) {
        isUserScroll.current = false
      }

      lastScrollTop.current = scrollTop
    }
  }, 100)

  useEffect(() => {
    const container = containerRef.current
    if (!isUserScroll.current && container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [$planMsg])

  const render = () => {
    if (planMode === 'activities') {
      return (
        <div id={$planMsg.id}>
          {$planMsg.agent_thoughts?.map((v) =>
            v.metadata?.langgraph_node &&
            !v.metadata?.langgraph_node?.includes('planner') &&
            !v.metadata?.langgraph_node?.includes('reporter') ? (
              <div key={v.id} id={v.id}>
                <MarkdownText message={v?.thought || ''} isSending={loading} />
                {v.tool_type ? (
                  <ExtraMessage
                    info={v}
                    handleClick={() => handleClickExtraItem(v)}
                  />
                ) : null}
                {!visible && visibleExtra && v.id === extraInfo.id ? (
                  <ExtraModal
                    type={
                      extraInfo?.tool_type === 'mcp_tool'
                        ? 'MCP Tools'
                        : 'Knowledge'
                    }
                    info={extraInfo}
                    onClose={() => {
                      setVisibleExtra(false)
                      setExtraInfo({})
                    }}
                  />
                ) : null}
              </div>
            ) : null
          )}
          {!$planMsg.reporterAnswer &&
          !$planMsg.agent_thoughts?.find((v) =>
            v.metadata?.langgraph_node?.includes('reporter')
          ) ? ( // 情况2：有 researcher，但它们的 thought 都为空
            <MarkdownText message={$planMsg.answer || ''} isSending={loading} />
          ) : null}
          {loading && !$planMsg.reporterAnswer ? (
            <span ref={cursorRef}>|</span>
          ) : null}
        </div>
      )
    }
    return (
      <div id={$planMsg.id}>
        {$planMsg.agent_thoughts?.map((v) => {
          if (v.metadata?.langgraph_node?.includes('reporter')) {
            return (
              <div key={v.id} id={v.id}>
                <MarkdownText message={v?.thought || ''} isSending={loading} />
              </div>
            )
          }
          return null
        })}
        {$planMsg.reporterAnswer &&
        (!$planMsg.agent_thoughts ||
          $planMsg.agent_thoughts.every(
            (thought) =>
              !thought?.metadata?.langgraph_node?.includes('reporter')
          )) ? (
          <MarkdownText message={$planMsg.answer || ''} isSending={loading} />
        ) : null}
        {loading ? <span ref={cursorRef}>|</span> : null}
      </div>
    )
  }

  return (
    <div className="w-1/2 h-full relative border-l-[0.5px] bg-white">
      <div className="flex justify-between items-center px-6 h-16 border-b border-gray-100 bg-white relative">
        <div className="flex space-x-8 h-full">
          <button
            className={`relative h-full flex items-center font-medium text-[16px] transition-colors ${
              planMode === 'activities'
                ? 'text-[#133EBF]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setPlanMode('activities')}
          >
            {t('Activities')}
            {planMode === 'activities' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#133EBF] rounded-t-md" />
            )}
          </button>

          <button
            className={`relative h-full flex items-center font-medium text-[16px] transition-colors ${
              planMode === 'report'
                ? 'text-[#133EBF]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setPlanMode('report')}
          >
            {t('Report')}
            {planMode === 'report' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#133EBF] rounded-t-md" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-6">
          {planMode === 'report' && (
            <>
              <div
                className="cursor-pointer ml-40"
                onClick={async () => {
                  if (
                    $planMsg.reporterAnswer &&
                    (!$planMsg.agent_thoughts ||
                      $planMsg.agent_thoughts.every(
                        (thought) =>
                          !thought?.metadata?.langgraph_node?.includes(
                            'reporter'
                          )
                      ))
                  ) {
                    await clipboard($planMsg.answer)
                    Message.success(t('Copy successfully'))
                    return
                  }
                  const reporter = $planMsg.agent_thoughts.find((v) =>
                    v.metadata?.langgraph_node?.includes('reporter')
                  )

                  await clipboard(reporter.thought)
                  Message.success(t('Copy successfully'))
                }}
              >
                <Tooltip content={t('Copy')}>
                  <IconCopy className="text-[18px] hover:text-[#1843bc]" />
                </Tooltip>
              </div>
              <div
                className="cursor-pointer"
                onClick={async () => {
                  // 获取要下载的内容
                  let content = ''

                  if (
                    $planMsg.reporterAnswer &&
                    (!$planMsg.agent_thoughts ||
                      $planMsg.agent_thoughts.every(
                        (thought) =>
                          !thought?.metadata?.langgraph_node?.includes(
                            'reporter'
                          )
                      ))
                  ) {
                    content = $planMsg.answer
                  } else {
                    const reporter = $planMsg.agent_thoughts.find((v) =>
                      v.metadata?.langgraph_node?.includes('reporter')
                    )
                    content = reporter.thought
                  }

                  // 创建Blob对象
                  const blob = new Blob([content], {type: 'text/markdown'})

                  // 创建下载链接
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'report.md' // 设置下载文件名

                  // 触发点击下载
                  document.body.appendChild(a)
                  a.click()

                  // 清理
                  setTimeout(() => {
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }, 100)

                  Message.success(t('Download successfully'))
                }}
              >
                <Tooltip content={t('Download')}>
                  <IconDownload className="text-[18px] hover:text-[#1843bc]" />
                </Tooltip>
              </div>
            </>
          )}

          <button
            onClick={() => {
              setOpenPlan(false)
              setVisibleExtra(false)
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        className="text-16 leading-[26px] text-[#03060E] font-400 h-[80%] overflow-auto m-5"
        onScroll={handleScroll}
        ref={containerRef}
      >
        {render()}
      </div>
    </div>
  )
}
