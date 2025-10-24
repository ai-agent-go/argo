/* eslint-disable @typescript-eslint/no-unused-vars */
import {IconLoading} from '@arco-design/web-react/icon'
import {useEffect, useMemo, useRef} from 'react'

// import ReactMarkdown from 'react-markdown'
import MarkdownText from '~/components/MarkdownText'

import EditMessage from '../EditMessage'
import s from './index.module.less'

function ResponseMessage({
  message,
  isEdit = false,
  changeIsEdit = (_: any) => {},
  handleEditConfirm = (_) => {},
  detail,
  loading = false,
  nameColor = '#AEAFB3',
}) {
  const cursorRef = useRef(null)
  const cursorInterval = useRef(null)

  useEffect(() => {
    if (loading && cursorRef.current && !message.sending) {
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
  }, [message.sending])

  const processedValue = useMemo(() => {
    // if (
    //   message.message.indexOf('<think>') > -1 &&
    //   message.message.indexOf('</think>') < 0
    // ) {
    //   message.message += '</think>'
    // }
    return message?.message
      ?.replace(/~/g, '\\~')
      ?.replace(/<think>([\s\S]*?)<\/think>/gi, (_, content) => {
        const lines = content
          .trim()
          .split('\n')
          .map((line: string) => (line ? `> ${line}` : '>'))
          .join('\n')
        return lines
      })
  }, [message.message])

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
          <div className="w-full">
            {!isEdit ? (
              <div className="flex space-x-2 py-[10px] px-[20px] rounded-tl-[4px] rounded-tr-[23px] rounded-bl-[23px] rounded-br-[23px] bg-[#F2F2F2E5] font-600 rounded-lg">
                <div
                  className={`markdown-body w-full text-16 leading-[26px] text-[#03060E] font-400 ${s['markdown-body']}`}
                  id={message.id}
                >
                  {message.sending ? (
                    <IconLoading />
                  ) : (
                    <div>
                      <MarkdownText
                        message={message.message || ''}
                        isSending={loading}
                      />
                      {loading ? <span ref={cursorRef}>|</span> : null}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EditMessage
                msg={message.message || ''}
                handleCancel={() => {
                  changeIsEdit(false)
                }}
                handleSubmit={handleEditConfirm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponseMessage
