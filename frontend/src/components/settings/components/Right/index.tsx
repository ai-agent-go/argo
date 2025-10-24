import React from 'react'
import {useTranslation} from 'react-i18next'

function SettingRight({activeTab, onClose}) {
  const {t} = useTranslation()
  return (
    <div className="relative flex-1 h-[720px] pb-4 overflow-y-auto rounded-xl flex flex-col no-scrollbar">
      <div className="sticky top-0 px-6 py-4 flex items-center h-15 border-b-[0.5px] border-b-[#EBEBEB] bg-white text-base font-600 text-gray-900 z-20">
        <div className="shrink-0">{t(activeTab.text)}</div>
        <div className="grow flex justify-end">
          <div
            className="flex items-center justify-center -mr-4 w-6 h-6 cursor-pointer"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400"
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
      {activeTab.comp()}
    </div>
  )
}

export default SettingRight
