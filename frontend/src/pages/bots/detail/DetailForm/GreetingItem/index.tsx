import {Input, Tooltip} from '@arco-design/web-react'
import {IconQuestionCircle} from '@arco-design/web-react/icon'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

function GreetingItem({value, onChange}: {value?: any; onChange?: any}) {
  const {t} = useTranslation()
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    setInputValue(value?.prologue)
  }, [value])

  return (
    <div className="p-[1px] box-border rounded-lg bg-[#EBEBEB]">
      <div className="rounded-lg bg-[#F9F9F9] overflow-hidden">
        <div className="flex justify-between items-center h-11 px-4 font-500">
          <div className="flex items-center space-x-1">
            <div className="h2 text-gray-850">{t('Greeting')}</div>
            <Tooltip
              content={t(
                "The Greeting will be inserted after the PROMPT as the AI assistant's message. (For certain models, Assistant's message should not be the first message, which may cause errors. You can clear Greeting or change models.)"
              )}
            >
              <IconQuestionCircle className="ml-1" />
            </Tooltip>
          </div>
        </div>
        <div className="relative">
          <div className="px-4 pt-2 bg-white rounded-t-xl text-sm text-gray-700 overflow-y-auto h-[100px]">
            <div className="relative h-full">
              <Input.TextArea
                autoSize={false}
                value={inputValue}
                onBlur={() => {
                  onChange(value)
                }}
                onChange={(e) => {
                  setInputValue(e)
                  value.prologue = e
                }}
                className="h-[80px] outline-none leading-5 text-[13px] text-gray-700 bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GreetingItem
