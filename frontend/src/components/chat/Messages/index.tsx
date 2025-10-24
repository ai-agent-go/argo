/* eslint-disable react/no-array-index-key */
import {Message} from '@arco-design/web-react'
import {IconCopy} from '@arco-design/web-react/icon'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {useTranslation} from 'react-i18next'

import PromptLog from '~/pages/bots/components/PromptLog'
import {clipboard} from '~/utils/clipboard'

import ResponseMessage from './OldResponseMessage'
import UserMessage from './UserMessage'

function ChatMessages({detail, chatList}) {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false)
  const [messageId, setMessageId] = useState('')

  return (
    <>
      <div className="w-full">
        {detail?.model_config?.prologue ? (
          <div className="flex flex-col justify-between mb-6 mx-auto rounded-lg group relative">
            <ResponseMessage
              message={{message: detail?.model_config?.prologue}}
              detail={detail}
              nameColor={detail.background_img ? '#F2F2F2' : '#AEAFB3'}
            />
          </div>
        ) : null}
      </div>
      <div className="w-full pt-2">
        {chatList.map((chat, idx) => {
          if (chat.type === 'user') {
            return (
              <div className="w-full" key={idx}>
                <div className="flex flex-col justify-between mb-6 mx-auto rounded-lg group">
                  <UserMessage
                    message={chat.message}
                    fileList={chat?.filelist || []}
                  />
                </div>
              </div>
            )
          }
          return (
            <div
              className={`w-full ${idx === chatList.length - 1 ? 'pb-12' : ''}`}
              key={idx}
            >
              <div className="flex flex-col justify-between mb-6  mx-auto rounded-lg group relative">
                <div className="absolute flex justify-end gap-1 -top-3.5 right-10">
                  <div className="hidden group-hover:flex items-center w-max h-[28px] p-0.5 rounded-lg shrink-0">
                    <div
                      onClick={async () => {
                        await clipboard(chat.message)
                        Message.success(t('Copying successfully'))
                      }}
                      className="shrink-0 p-1 mr-2 flex items-center justify-center rounded-[6px] hover:bg-gray-50 bg-white border-[0.5px] border-gray-100 cursor-pointer"
                    >
                      <IconCopy className="text-16 text-gray-500 hover:text-gray-70 font-500" />
                    </div>
                    <div
                      onClick={() => {
                        setMessageId(chat.messageId)
                        setVisible(true)
                      }}
                      className="shrink-0 p-1 flex items-center justify-center rounded-[6px] font-500 text-gray-500 hover:bg-gray-50 bg-white border-[0.5px] border-gray-100 cursor-pointer hover:text-gray-700"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 w-4 h-4"
                        data-icon="File02"
                        aria-hidden="true"
                      >
                        <g id="Icon">
                          <path
                            id="Icon_2"
                            d="M9.33366 7.3335H5.33366M6.66699 10.0002H5.33366M10.667 4.66683H5.33366M13.3337 4.5335V11.4668C13.3337 12.5869 13.3337 13.147 13.1157 13.5748C12.9239 13.9511 12.618 14.2571 12.2416 14.4488C11.8138 14.6668 11.2538 14.6668 10.1337 14.6668H5.86699C4.74689 14.6668 4.18683 14.6668 3.75901 14.4488C3.38269 14.2571 3.07673 13.9511 2.88498 13.5748C2.66699 13.147 2.66699 12.5869 2.66699 11.4668V4.5335C2.66699 3.41339 2.66699 2.85334 2.88498 2.42552C3.07673 2.04919 3.38269 1.74323 3.75901 1.55148C4.18683 1.3335 4.74689 1.3335 5.86699 1.3335H10.1337C11.2538 1.3335 11.8138 1.3335 12.2416 1.55148C12.618 1.74323 12.9239 2.04919 13.1157 2.42552C13.3337 2.85334 13.3337 3.41339 13.3337 4.5335Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      </svg>
                      <div className="text-xs leading-4">
                        {t('Prompt Logs')}
                      </div>
                    </div>
                  </div>
                </div>
                <ResponseMessage
                  message={chat}
                  detail={detail}
                  nameColor={detail.background_img ? '#F2F2F2' : '#AEAFB3'}
                />
              </div>
            </div>
          )
        })}
      </div>
      {ReactDOM.createPortal(
        <PromptLog
          visible={visible}
          onClose={() => {
            setMessageId('')
            setVisible(false)
          }}
          messageId={messageId}
        />,
        document.body
      )}
    </>
  )
}

export default ChatMessages
