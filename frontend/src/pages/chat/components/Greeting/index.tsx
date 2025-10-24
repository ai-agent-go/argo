import React from 'react'
import {useTranslation} from 'react-i18next'

import MarkdownText from '~/components/MarkdownText'

function GreetingContainer({detail}) {
  const {t} = useTranslation()
  if (!detail.name) return null
  return (
    <div className="h-full overflow-scroll flex no-scrollbar mb-5 mask w-full">
      <div className="w-full py-5 px-5 my-auto border-box flex flex-col items-center justify-center bg-white rounded-[20px]">
        <img
          src={detail.icon}
          alt="icon"
          className="w-[72px] h-[72px] rounded-[10px] object-cover"
        />
        <div className="text-[#03060E] font-500 text-[24px] leading-[38px] text-center my-[10px]">
          {detail.name}
        </div>
        <div className="text-[#AEAFB3] font-400 text-[16px] leading-[160%] mb-8">
          {detail.description}
        </div>
        {detail.model_config.prologue ? (
          <div className="bg-[#F2F2F2]/90 rounded-[20px] overflow-scroll px-5 py-3 w-full min-h-[112px] h-max mb-auto box-border text-[#1D2129] font-400 text-[14px] leading-[160%]">
            <MarkdownText
              message={t(detail.model_config.prologue)}
              isSending={false}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default React.memo(GreetingContainer)
