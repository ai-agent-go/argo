import React from 'react'
import {useTranslation} from 'react-i18next'

import {VARIABLE_ICONS, VARIABLE_TYPES} from '~/pages/constants'

function VariableType({value = '', onChange = () => {}}: any) {
  const {t} = useTranslation()
  return (
    <div className="flex">
      {VARIABLE_TYPES.items().map((item) => (
        <div
          key={item.value}
          className={`flex-1 mr-[12px] h-[77px] p-[12px] box-border rounded-[8px] flex-col items-center justify-center ${value === item.value ? 'bg-[#03060E] text-[#fff]' : 'bg-[#f9f9f9] text-[#565759]'}`}
          onClick={() => {
            if (value !== item.value) {
              onChange(item.value)
            }
          }}
        >
          <div className="text-center flex justify-center">
            {VARIABLE_ICONS[item.alias]({
              className:
                value === item.value ? 'text-[#fff]' : 'text-[#565759]',
            })}
          </div>
          <div className="text-center">{t(item.text)}</div>
        </div>
      ))}
    </div>
  )
}

export default VariableType
