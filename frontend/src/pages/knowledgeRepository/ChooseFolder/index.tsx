import {Message, Tooltip} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

import {isInArgo} from '~/utils'

function ChooseFolder({value, onChange}: {value?: string; onChange?: any}) {
  const {t} = useTranslation()

  const handleChooseFolder = async () => {
    if (!isInArgo()) {
      Message.error(
        t(
          'This feature is not supported on the web version for now. Please use it in the client.'
        )
      )
      return
    }
    try {
      const data = await window.argoBridge.selectFolder()
      onChange(data)
    } catch (err) {
      Message.error(err)
    }
  }
  return (
    <Tooltip content={value || null}>
      <div
        className="px-2  rounded-xl w-max cursor-pointer text-[14px] font-500 outline-none border max-w-[450px] max-h-[46px] overflow-hidden leading-[46px] text-ellipsis whitespace-nowrap"
        onClick={handleChooseFolder}
      >
        {value || t('Choose Folder')}
      </div>
    </Tooltip>
  )
}

export default ChooseFolder
