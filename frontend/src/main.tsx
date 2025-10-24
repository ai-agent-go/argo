import {ConfigProvider} from '@arco-design/web-react'
import {loadableReady} from '@loadable/component'
import {Provider} from 'jotai'
import {memo, Suspense, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import {I18nextProvider, useTranslation} from 'react-i18next'

import App from './App'
import {setLanguages} from './lib/apis/settings'
import i18n from './lib/i18n'
import {arcoLocales} from './lib/locales'
import {inChina} from './lib/utils'
import {changeLanguage} from './utils/bridge'

const Application = memo(() => {
  const currentLanguage = i18n.language
  const {t, i18n: $i18n} = useTranslation()
  const getI18n = async () => {
    if ($i18n.language !== localStorage.locales || !localStorage.locales) {
      $i18n.changeLanguage(
        localStorage.locales || inChina() ? 'zh' : 'en',
        () => {
          setLanguages($i18n.language)
          changeLanguage($i18n.language)
        }
      )
    } else {
      setLanguages($i18n.language)
      changeLanguage($i18n.language)
    }
  }

  useEffect(() => {
    getI18n()
  }, [])

  return (
    <Suspense>
      <Provider>
        <I18nextProvider i18n={i18n}>
          <ConfigProvider
            componentConfig={{
              Form: {
                validateMessages: {
                  required: (_, {label}) => t('Please enter', {name: t(label)}), // 使用模板字符串统一格式
                },
              },
            }}
            locale={arcoLocales[currentLanguage]}
            tablePagination={{
              sizeCanChange: true,
              sizeOptions: [10, 15, 20, 25, 30, 40, 50],
            }}
          >
            <App />
          </ConfigProvider>
        </I18nextProvider>
      </Provider>
    </Suspense>
  )
})

loadableReady(() => {
  const root = document.getElementById('root')
  ReactDOM.createRoot(root).render(<Application />)
})
