import {Message} from '@arco-design/web-react'
import React, {useEffect, useReducer, useState} from 'react'
import {useTranslation} from 'react-i18next'

import SelectedIcon from '~/components/icons/SelectedIcon'
import {setLanguages} from '~/lib/apis/settings'
import {changeLanguage as changeElectronLanguage} from '~/utils/bridge'

const LanguageType = [
  {label: 'English(US)', value: 'en'},
  {label: '简体中文', value: 'zh'},
]

function Language() {
  const {t, i18n, ready} = useTranslation()
  const [language, setLanguage] = useState('')
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const getCurLanguage = () => {
    setLanguage(i18n.language)
  }

  const changeLanguage = (v) => {
    localStorage.setItem('locales', v)
    i18n.changeLanguage(v, () => {
      setLanguages(i18n.language)
      forceUpdate()
    })
    setLanguage(v)
    changeElectronLanguage(v)

    window.postMessage({locales: v}, '*')
    Message.success(t('Setting Success'))
  }

  useEffect(() => {
    getCurLanguage()
  }, [])

  return (
    <div className="mt-[20px] mx-6">
      <div className="text-[#565759] text-[14px] leading-[18px] font-500 mb-[12px]">
        {t('Display Language')}
      </div>
      {/* <Select
        className="border-[1px] border-[#EBEBEB] rounded-[8px] py-[2px] px-[4px] bg-[#F9F9F9]"
        options={LanguageType}
        value={language}
        onChange={changeLanguage}
        bordered={false}
      /> */}
      <div className="grid grid-cols-3 gap-3">
        {LanguageType.map((languageItem) => (
          <div
            key={languageItem.value}
            className={`h-[100px] rounded-[8px] border-[1px] border-[#EBEBEB] text-[#03060E] text-[16px] font-500 leading-[100px] text-center ${language === languageItem.value ? 'border-[#133EBF] bg-[#F2F6FF] font-600 relative' : ''}`}
            onClick={() => {
              changeLanguage(languageItem.value)
            }}
          >
            {t(languageItem.label)}
            {language === languageItem.value ? (
              <SelectedIcon className="absolute top-[-1px] right-[-1px]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Language
