import {Message} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {getMessageInfoById} from '~/lib/apis/chats'

function PromptLog({messageId, visible, onClose}) {
  const {t} = useTranslation()
  const [list, setList] = useState([])
  const getData = async () => {
    try {
      const {data} = await getMessageInfoById(messageId)
      setList(data.prompt_messages || [])
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  useEffect(() => {
    if (visible && messageId) {
      getData()
    }
  }, [visible, messageId])
  if (!visible) return null
  return (
    <div
      className="fixed top-16 left-[300px] bottom-2 w-[480px] flex flex-col bg-white border-[0.5px] border-gray-200 rounded-xl shadow-xl z-[11] max-h-[calc(100vh-200px)]"
      // style="width: 480px; top: 64px; left: 229px; bottom: 16px;"
    >
      <div className="shrink-0 flex justify-between items-center pl-6 pr-5 h-14 border-b border-b-gray-100">
        <div className="text-base font-semibold text-gray-900">
          {t('PROMPT LOG')}
        </div>
        <div className="flex items-center">
          <div
            className="flex justify-center items-center w-6 h-6 cursor-pointer"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-500"
              data-icon="XClose"
              aria-hidden="true"
            >
              <g id="x-close">
                <path
                  id="Icon"
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="grow p-2 overflow-y-auto">
        <div>
          {list.map((item, idx) => (
            <div
              key={idx}
              className="group/card mb-2 px-4 pt-2 pb-4 rounded-xl hover:bg-gray-50 last-of-type:mb-0 "
            >
              <div className="flex justify-between items-center h-8">
                <div className="font-600 text-[#2D31A6] text-[24px]">
                  {item.role}
                </div>
                <div className="inline-block">
                  <div className="cursor-pointer hover:bg-gray-100 rounded-lg hidden w-6 h-6 group-hover/card:block">
                    <div className="w-full h-full style_copyIcon__euyNI " />
                  </div>
                </div>
              </div>
              <div className="whitespace-pre-line text-gray-700 text-[18px]">
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromptLog
