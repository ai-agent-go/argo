import {Message} from '@arco-design/web-react'
import {IconExclamationCircleFill} from '@arco-design/web-react/icon'
import i18next, {t} from 'i18next'
import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import {ollamaServiceCheck} from '~/lib/apis/models'
import {platForm} from '~/lib/utils'

import Restart from '../images/restart'
import RightTopArrow from '../images/rightTopArrow'
import InstalledModelPage from '../installedModel'
import {menuTabs} from '../menuConfig'
import ModelStorePage from '../modelStore'

function LocalModel({
  LLMConnectError,
  setLLMConnectError,
  setEditing,
  ollamaModel,
  setOllamaModel,
}) {
  const [inputValue, setInputValue] = useState('')
  const [downloadType, setDownloadType] = useState('Installed Model')
  const [checkUsable, setCheckUsable] = useState(true)
  const {spaceId} = useParams<{spaceId: string}>()
  const [refreshInstall, setRefreshInstall] = useState(0)

  const setCheckError = () => {
    let downloadLink = ''
    if (platForm() === 'Windows') {
      const url =
        'https://github.com/ollama/ollama/releases/download/v0.6.8/OllamaSetup.exe'
      downloadLink =
        i18next.language === 'zh'
          ? `若未下载Ollama, <a style='color: #133EBF;' href='${url}' target='_blank'>点击这里下载</a>`
          : `If Ollama has not been downloaded, <a style='color: #133EBF;' href='${url}' target='_blank'>click here to download it</a>`
    } else {
      downloadLink = ''
    }
    setLLMConnectError(
      t('ollamaServiceNotAvailable', {
        downloadLink,
      })
    )
  }

  const serviceCheck = async (checkUrl?) => {
    try {
      await ollamaServiceCheck(checkUrl || inputValue)
      setLLMConnectError('')
      // update ollama information after check pass, update it's base_url attribute
      ollamaModel.credentials.base_url = checkUrl || inputValue
      setOllamaModel(ollamaModel)
      setCheckUsable(true)
      setRefreshInstall((pre) => pre + 1)
      if (!checkUrl) Message.success(t('Check Success'))
    } catch (error) {
      setCheckUsable(true)
      setCheckError()
    }
  }

  useEffect(() => {
    if (LLMConnectError) {
      setCheckError()
    }
  }, [i18next.language])

  useEffect(() => {
    // 设置成上一次检查通过的地址
    if (ollamaModel.credentials.base_url) {
      serviceCheck(ollamaModel.credentials.base_url)
      setInputValue(ollamaModel.credentials.base_url)
    }
  }, [ollamaModel.credentials.base_url])

  return (
    <div className="flex-1 w-[900px]">
      <div className="h-[82px] leading-[82px] pl-5 pb-[10px] border-b-[0.5px] border-b-[#ebebeb] text-[#03060E] text-700 text-[28px] font-700">
        ARGO-LLM
      </div>
      {LLMConnectError && (
        <div className="h-[54px] flex items-center pl-[25px] bg-[#FDEEED] text-[#000]">
          <IconExclamationCircleFill className="text-[#EB5746] mr-2 text-[20px]" />
          <span
            className="flex-1"
            dangerouslySetInnerHTML={{__html: LLMConnectError}}
          />
        </div>
      )}

      <div className="p-5">
        <div>
          <div className="flex items-center mb-3">
            <span className="font-500 text-16 text-[#03060E] mr-3">
              {t('Ollama API URL')}
            </span>
            <a
              href="https://docs.xark-argo.com/getting-started/model_usage#ollama-provider"
              className="text-[#133EBF] font-500"
              target="_blank"
              rel="noreferrer"
            >
              {t('Get Tutorial')}
            </a>
            <RightTopArrow />
          </div>
          <div className="flex h-11">
            <input
              value={inputValue}
              onChange={(e) => {
                setEditing(true)
                setInputValue(e.target.value)
              }}
              className="border border-[#ebebeb] rounded-l-lg flex-1 p-3 text-[#03060E]"
              type="text"
              name=""
              id=""
            />
            <div
              className="flex gap-1 leading-[44px] w-[87px] rounded-r-lg bg-[#F2F6FF] border border-[#ebebeb] items-center justify-center mr-4"
              onClick={() => {
                setEditing(false)
                setInputValue(ollamaModel.credentials.origin_url)
              }}
            >
              <Restart />
              <span className="text-[#133EBF] cursor-pointer">
                {t('Reset')}
              </span>
            </div>
            <div
              className={`text-[#fff] rounded-lg bg-[#133ebf] w-[100px] text-center leading-[44px] font-600 cursor-pointer ${checkUsable ? '' : 'opacity-30 pointer-events-none'}`}
              onClick={() => {
                setEditing(false)
                serviceCheck()
                setCheckUsable(false)
                const timer = setTimeout(() => {
                  setCheckUsable(true)
                  clearTimeout(timer)
                }, 10000)
              }}
            >
              {checkUsable ? t('Check') : t('Checking...')}
            </div>
          </div>
        </div>
        <div className="w-full h-11 mt-4">
          <div className="flex gap-9">
            {menuTabs(spaceId).map((item) => (
              <div
                className={`h-11 flex gap-1 items-center cursor-pointer ${downloadType === item.key ? 'text-[#133EBF] border-b-[1.5px] border-[#133EBF]' : 'text-[#565759]'}`}
                onClick={() => setDownloadType(item.key)}
                key={item.key}
              >
                <item.src
                  color={downloadType === item.key ? '#133EBF' : '#565759'}
                />
                <span className="font-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-y-scroll h-[calc(100vh-300px)]">
          {downloadType === 'Installed Model' ? (
            <InstalledModelPage
              LLMConnectError={LLMConnectError}
              refreshInstall={refreshInstall}
            />
          ) : (
            <ModelStorePage
              LLMConnectError={LLMConnectError}
              ollamaModel={ollamaModel}
              setDownloadType={setDownloadType}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default LocalModel
