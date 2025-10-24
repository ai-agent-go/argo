import {Input, Message, Select} from '@arco-design/web-react'
import {IconDownload} from '@arco-design/web-react/icon'
import {t} from 'i18next'
import {useEffect, useState} from 'react'

import {downloadHotModel, downloadModel, parseModelUrl} from '~/lib/apis/models'

import RightTopArrow from '../../images/rightTopArrow'
import DownloadModel from '../DownloadModel'

export default function URLDownLoad({LLMConnectError, ollamaModel}) {
  const [type, setType] = useState('huggingface')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [visible, setVisible] = useState(false)
  const [ollamaName, setOllamaName] = useState('')
  const [ollamaSize, setOllamaSize] = useState('')
  const [downloadInfos, setDownloadInfos] = useState({repo_id: 0})

  const showDownloadModal = async () => {
    if (LLMConnectError)
      return Message.warning(t('Ollama service is not available'))
    if (downloadUrl === '')
      return Message.warning(t('Please Enter Download URL'))
    setVisible(true)

    try {
      const data = await parseModelUrl({
        repo: downloadUrl,
      })
      setDownloadInfos(data || {repo_id: 0, gguf_file_list: []})
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
      setVisible(false)
    }
    return null
  }

  const downloadOllama = async () => {
    if (LLMConnectError)
      return Message.warning(t('Ollama service is not available'))
    if (ollamaName === '')
      return Message.error(t('Please enter ollama name to download'))
    try {
      await downloadHotModel({
        model_name: ollamaName,
        parameter: ollamaSize,
      })
      Message.success(t('Add to download list'))
      setOllamaName('')
      setOllamaSize('')
      // getModels()
      return null
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return null
  }

  const renderDownloadInfo = () => {
    if (type === 'huggingface') {
      return (
        <div className=" flex w-full items-center">
          <Input
            className=" w-[737px] h-[44px] bg-[#F9F9F9] rounded-[8px] outline-none mr-4 overflow-hidden flex-1"
            value={downloadUrl}
            onChange={(v) => setDownloadUrl(v)}
            placeholder={t('use huggingface repo id or url')}
          />
          <div
            className={`w-11 h-11 bg-[#03060E] rounded-[8px] flex justify-center items-center mr-6 ${LLMConnectError ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={showDownloadModal}
          >
            <IconDownload className="text-[18px] text-white" />
          </div>
          <a
            href="https://huggingface.co/models"
            target="_blank"
            rel="noreferrer"
            className="text-[#133EBF] flex gap-1 items-center font-500"
          >
            {t('Official Website')}
            <RightTopArrow />
          </a>
        </div>
      )
    }
    return (
      <div className=" flex w-full items-center">
        <Input
          className=" w-[220px] h-[44px] bg-[#F9F9F9] rounded-[8px] outline-none mr-4 overflow-hidden"
          value={ollamaName}
          onChange={(v) => setOllamaName(v)}
          placeholder={t('enter ollama name')}
        />
        :
        <Input
          className=" w-[220px] h-[44px] bg-[#F9F9F9] rounded-[8px] outline-none mx-4 overflow-hidden"
          value={ollamaSize}
          onChange={(v) => setOllamaSize(v)}
          placeholder={t('ollama tag, eg: latest or 7b')}
        />
        <div
          className={`w-11 h-11 bg-[#03060E] rounded-[8px] flex justify-center mr-6 items-center ${LLMConnectError ? 'opacity-30 cursor-not-allowed' : ''}`}
          onClick={downloadOllama}
        >
          <IconDownload className="text-[18px] text-white" />
        </div>
        <a
          href="https://ollama.com/search"
          target="_blank"
          rel="noreferrer"
          className="text-[#133EBF] flex gap-1 items-center font-500"
        >
          {t('Official Website')}
          <RightTopArrow />
        </a>
      </div>
    )
  }

  const handleDownload = async (model) => {
    if (LLMConnectError) {
      Message.error(t('Ollama service is not available'))
    }
    await downloadModel({
      repo_id: downloadInfos.repo_id,
      ...model,
    })
    Message.success(t('Downloading'))
    setVisible(false)
    setDownloadUrl('')
    setDownloadInfos({repo_id: 0})
    const href = window.location.href.replace('/store', '/installed')
    window.location.href = href
  }

  useEffect(() => {
    if (
      !ollamaModel.credentials.base_url.includes('localhost:11434') &&
      !ollamaModel.credentials.base_url.includes('127.0.0.1:11434')
    ) {
      setType('ollama')
    } else {
      setType('huggingface')
    }
  }, [ollamaModel.credentials.base_url])

  return (
    <div className="flex w-full space-x-2">
      <div className=" flex w-full">
        <Select
          value={type}
          onChange={setType}
          className="w-[200px] mr-4 rounded-[8px] bg-[#F9F9F9] h-[44px] flex items-center"
          bordered={false}
        >
          {(ollamaModel.credentials.base_url.includes('localhost:11434') ||
            ollamaModel.credentials.base_url.includes('127.0.0.1:11434')) && (
            <Select.Option value="huggingface">huggingface</Select.Option>
          )}
          <Select.Option value="ollama">ollama</Select.Option>
        </Select>
        {renderDownloadInfo()}
      </div>

      {visible ? (
        <DownloadModel
          visible={visible}
          onClose={() => {
            setVisible(false)
            setDownloadInfos({repo_id: 0})
          }}
          modelInfos={downloadInfos}
          handleDownload={handleDownload}
        />
      ) : null}
    </div>
  )
}
