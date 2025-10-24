import {IconRecordStop} from '@arco-design/web-react/icon'
import React from 'react'
import {useTranslation} from 'react-i18next'

function StopChat({loading, handleStop}) {
  const {t} = useTranslation()
  if (!loading) return null
  return (
    <div className="absolute bottom-4 left-[50%] -translate-x-1/2 z-50">
      <button
        className=" flex items-center justify-center px-4 py-2 border-[1px] border-gray-300 bg-white text-14 font-600 rounded-xl"
        onClick={handleStop}
      >
        <IconRecordStop className="mr-3" /> {t('Stop')}
      </button>
    </div>
  )
}

export default StopChat
