import {Message} from '@arco-design/web-react'
import {Fragment, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'

import {
  getBotList,
  installBot,
  installStatus,
  updateBotConfig,
  updateKnowledgeConfig,
} from '~/lib/apis/bots'
import {getModelList} from '~/lib/apis/models'
import {formatSize, mergeObjects} from '~/lib/utils'
import {STATUS_TYPE} from '~/pages/models/constants'

import InstallItem from './InstallItem/InstallItem'

enum InstallStatus {
  fail,
  complete,
  downloading,
  pause,
  notDownload,
  incompatible,
}

function Installation({
  botId,
  spaceId,
  detail,
  isEdit = false,
  setInstalled = null,
  refresh = () => {},
}) {
  const {t} = useTranslation()
  const [installing, setInstalling] = useState(false)
  const [buttonText, setButtonText] = useState(t('Quick Install')) // Download and Install   Reinstall  Installation Complete!    Installing...

  const [buttonClass, setButtonClass] = useState('text-white bg-[#03060e]') // text-[#03060e]           bg-[#ebebeb] text-[#aeafb3]
  const [modelStatus, setModelStatus] = useState(null)
  const [chatModels, setChatModels] = useState([])
  const [embeddingModels, setEmbeddingModels] = useState([])
  const [changeModel, setChangeModel] = useState({name: '', provider: ''})
  const [knowledgeModel, setKnowledgeModel] = useState([])
  const [chatModelsStatue, setChatModelsStatue] = useState('')
  const [embeddingModelsStatue, setEmbeddingModelsStatue] = useState([])
  const [disableInstall, setDisableInstall] = useState(false)
  const [modelList, setModelList] = useState([])
  const history = useHistory()

  const timer = useRef(null)

  const getModels = async () => {
    const data = await getModelList({
      download_status: 'all_complete',
    })
    setModelList(data?.model_list || [])
    if (data?.model_list && data?.model_list?.length > 0) {
      const embeddingModel = data.model_list.filter(
        (item) => item.is_embeddings
      )
      const chatModel = data.model_list.filter((item) => item.is_generation)
      setChatModels(chatModel)
      setEmbeddingModels(embeddingModel)
    }
  }

  const handleChangeModelConfig = async () => {
    const select = modelList.find((v) => {
      return (
        changeModel.name === v.model_name && changeModel.provider === v.provider
      )
    })
    let vals
    if (select) {
      vals = {
        model: {...changeModel, icon_url: select.icon_url, model_id: select.id},
      }
    } else {
      vals = {model: changeModel}
    }
    const newConfigs = mergeObjects(detail, {model_config: {...vals}})
    detail.model_config = newConfigs.model_config
    await updateBotConfig({
      model_config: detail.model_config,
      bot_id: detail.id,
    })
    refresh()
  }

  const handleChangeKnowledgeConfig = async () => {
    await updateKnowledgeConfig({
      bot_id: detail.id,
      collection_name: modelStatus.knowledge_info_list.map(
        (item) => item.collection_name
      ),
      embedding_model: knowledgeModel.map((item) => item.name),
    })
    refresh()
  }

  const chatModelStatus = (data) => {
    if (data.chat_model_info.download_status) {
      if (data.chat_model_info.download_status.includes('fail')) {
        return InstallStatus.fail
      }
      if (data.chat_model_info.download_status === 'all_complete') {
        return InstallStatus.complete
      }
      if (data.chat_model_info.download_status === 'download_pause') {
        return InstallStatus.pause
      }
      if (data.chat_model_info.download_status === 'delete') {
        return InstallStatus.notDownload
      }
      if (data.chat_model_info.download_status === 'environment_incompatible') {
        return InstallStatus.incompatible
      }
      return InstallStatus.downloading
    }
    return InstallStatus.complete
  }

  const embeddingModelStatus = (data) => {
    if (data.embedding_model_info_list.length) {
      if (
        data.embedding_model_info_list.some((item) =>
          item.download_status.includes('fail')
        )
      ) {
        // 安装失败
        return InstallStatus.fail
      }
      if (
        data.embedding_model_info_list.every(
          (item) => item.download_status === 'all_complete'
        )
      ) {
        // 安装成功
        return InstallStatus.complete
      }
      if (
        data.embedding_model_info_list.some(
          (item) => item.download_status === 'delete'
        )
      ) {
        return InstallStatus.notDownload
      }
      if (
        data.embedding_model_info_list.every(
          (item) => item.download_status === 'download_pause'
        )
      ) {
        return InstallStatus.pause
      }
      if (
        data.embedding_model_info_list.some(
          (item) => item.download_status === 'environment_incompatible'
        )
      ) {
        return InstallStatus.incompatible
      }
      return InstallStatus.downloading
    }
    // 无需安装
    return InstallStatus.complete
  }

  const knowledgeStatus = (data) => {
    if (data.knowledge_info_list.length) {
      if (
        data.knowledge_info_list.some((item) => item.knowledge_status === 2)
      ) {
        return InstallStatus.fail
      }
      if (
        data.knowledge_info_list.every((item) => item.knowledge_status === 3)
      ) {
        return InstallStatus.complete
      }
      if (
        data.knowledge_info_list.every((item) => item.knowledge_status === 4)
      ) {
        return InstallStatus.notDownload
      }
      return InstallStatus.downloading
    }
    return InstallStatus.complete
  }

  const getInstallStatus = async () => {
    try {
      const data = await installStatus({
        bot_id: botId,
      })
      setModelStatus(data)
      if (
        chatModelStatus(data) !== InstallStatus.downloading &&
        embeddingModelStatus(data) !== InstallStatus.downloading &&
        knowledgeStatus(data) !== InstallStatus.downloading
      ) {
        clearInterval(timer.current)
      }

      if (
        chatModelStatus(data) === InstallStatus.notDownload ||
        embeddingModelStatus(data) === InstallStatus.notDownload
      ) {
        setInstalling(false)
        setButtonClass('text-white bg-[#03060e]')
        setButtonText(t('Download and Install'))
      }

      if (
        chatModelStatus(data) === InstallStatus.incompatible ||
        embeddingModelStatus(data) === InstallStatus.incompatible
      ) {
        setInstalling(false)
        setDisableInstall(true)
        setButtonClass('text-white bg-[#03060e]')
        setButtonText(t('Download and Install'))
      }

      if (
        chatModelStatus(data) === InstallStatus.fail ||
        embeddingModelStatus(data) === InstallStatus.fail ||
        knowledgeStatus(data) === InstallStatus.fail
      ) {
        setButtonText(t('Reinstall'))
        setInstalling(false)
        setButtonClass('text-white bg-[#03060e]')
      }

      if (
        chatModelStatus(data) === InstallStatus.complete &&
        embeddingModelStatus(data) === InstallStatus.complete &&
        knowledgeStatus(data) === InstallStatus.complete
      ) {
        setButtonText(t('Installation Complete!'))
        setInstalling(false)
        setButtonClass('')

        if (isEdit) {
          setInstalled(true)
          setTimeout(() => {
            refresh()
          }, 1000)
        } else {
          const timeout = setTimeout(() => {
            history.replace(`/bots/${spaceId}/chat?botId=${botId}`)
            clearTimeout(timeout)
          }, 2000)
        }
      }
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const getStatus = () => {
    getInstallStatus()
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      getInstallStatus()
    }, 2000)
  }

  const install = async () => {
    handleChangeModelConfig()
    handleChangeKnowledgeConfig()
    try {
      const data = await installBot({
        bot_id: botId,
      })
      setInstalling(true)
      if (data?.status) {
        setButtonText(t('Installing...'))
        setButtonClass('bg-[#ebebeb] text-[#aeafb3]')
      }
      getStatus()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const createInstallList = (key) => {
    const item = modelStatus[key]
    if (key === 'embedding_model_info_list') {
      return item.map((i, index) => (
        <InstallItem
          key={i}
          item={i}
          defaultModel={modelStatus.knowledge_info_list[index].embedding_model}
          modeList={embeddingModels}
          text={t('Embedding model')}
          speed={`(${formatSize(i.download_speed)}/s)`}
          status={i.download_status}
          percent={i.download_progress}
          installing={installing}
          addModel={i.model_name}
          handleChangeModel={(value) => {
            setKnowledgeModel((prevState) => {
              const newArray = [...prevState]
              newArray[index] = value
              return newArray
            })
            setEmbeddingModelsStatue((prevState) => {
              const newArray = [...prevState]
              newArray[index] =
                value.name === i.model_name && value.provider === i.provider
                  ? i.download_status
                  : 'all_complete'
              return newArray
            })
          }}
          install={install}
          getStatus={getStatus}
        />
      ))
    }
    if (key === 'knowledge_info_list') {
      return item.map((i) => {
        let status = null
        if (i.knowledge_status === 1) {
          status = 'importing'
        }
        if (i.knowledge_status === 2) {
          status = 'import_failed'
        }
        if (i.knowledge_status === 3) {
          status = 'imported'
        }
        if (i.knowledge_status === 4 || i.knowledge_status === 0) {
          status = 'not_imported'
        }
        return (
          <Fragment key={i.knowledge_name}>
            <div className="text-[#03060E] font-500 text-14 mt-1 mb-[-8px]">
              {t('Knowledge to be imported')}
            </div>
            <InstallItem
              key={i}
              text={`${t('Creating')} "${i.knowledge_name}" ${t('Corpus')}.`}
              speed=""
              status={status}
              percent={(i.knowledge_progress * 100).toFixed(0)}
              installing={installing}
              install={install}
              getStatus={getStatus}
            />
          </Fragment>
        )
      })
    }
    if (key === 'chat_model_info' && Object.keys(item).length) {
      return (
        <Fragment key={key}>
          <div className="text-[#03060E] font-500 text-14 leading-[22px] mb-[-8px]">
            {t('Used model')}
          </div>
          <InstallItem
            item={item}
            text={t('Chat model')}
            speed={`(${formatSize(item.download_speed)}/s)`}
            status={item.download_status}
            percent={item.download_progress}
            modeList={chatModels}
            defaultModel={item.model_name}
            handleChangeModel={(value) => {
              setChangeModel(value)
              if (
                value.name === item.model_name &&
                value.provider === item.provider
              ) {
                setChatModelsStatue(
                  item.provider_status || item.download_status
                )
              } else {
                setChatModelsStatue(
                  value.provider === 'ollama' ? 'all_complete' : 'available'
                )
              }
            }}
            installing={installing}
            addModel={item.model_name}
            install={install}
            getStatus={getStatus}
          />
        </Fragment>
      )
    }
    return null
  }

  const getBot = async () => {
    const data = await getBotList({space_id: spaceId})
    const bot = data.bots.find((item) => item.id === botId)
    getInstallStatus()
    if (!bot) return
    if (bot?.status === 'installing') {
      setInstalling(true)
      setButtonText(t('Installing...'))
      setButtonClass('bg-[#ebebeb] text-[#aeafb3]')
      // 正在安装，请求安装状态
      clearInterval(timer.current)
      timer.current = setInterval(() => {
        getInstallStatus()
      }, 2000)
    } else if (bot?.status === 'fail') {
      setButtonText(t('Reinstall'))
      setInstalling(false)
      setButtonClass('text-white bg-[#03060e]')
    }
  }

  useEffect(() => {
    if (!chatModelsStatue) return
    const isDownloading =
      STATUS_TYPE[chatModelsStatue] === 'downloading' ||
      embeddingModelsStatue.some((item) => STATUS_TYPE[item] === 'downloading')
    const isPause =
      STATUS_TYPE[chatModelsStatue] === 'download_pause' ||
      embeddingModelsStatue.some(
        (item) => STATUS_TYPE[item] === 'download_pause'
      )
    // 正在下载时中不改变按钮状态
    if (isDownloading || isPause) return
    setDisableInstall(false)
    const isIncompatible =
      chatModelsStatue === 'environment_incompatible' ||
      embeddingModelsStatue.some((item) => item === 'environment_incompatible')

    const isComplete =
      embeddingModelsStatue.every((item) => item === 'all_complete') &&
      ['available', 'all_complete', 'not_init'].includes(chatModelsStatue)

    if (isIncompatible) {
      setDisableInstall(true)
      setButtonClass('text-white bg-[#03060e]')
      return
    }

    if (isComplete) {
      setInstalling(false)
      setButtonText(t('Quick Install'))
      setButtonClass('text-white bg-[#03060e]')
      return
    }

    setInstalling(false)
    setButtonText(t('Download and Install'))
    setButtonClass('text-white bg-[#03060e]')
  }, [chatModelsStatue, embeddingModelsStatue])

  useEffect(() => {
    getBot()
    getModels()
    return () => {
      clearInterval(timer.current)
    }
  }, [detail])

  if (!modelStatus) return null

  return (
    <div className="rounded-2xl border-[0.5px] py-6 px-[30px] box-border bg-slate-50 border-[#03060e] flex flex-col items-center bg-[url('~/assets/install_cardbg.png')] bg-no-repeat mx-6">
      <div className="text-[#03060e] font-600 text-xl leading-8 font-['SF Pro Display']">
        {t('Initial installation')}
      </div>
      <div className="py-6 flex flex-col text-[#03060e] text-sm leading-[22.4px] gap-3 max-h-80 overflow-auto">
        {Object.keys(modelStatus).map((key) => {
          return createInstallList(key)
        })}
      </div>

      <button
        className={`${buttonClass} w-[180px] h-[42px] font-500 text-base rounded-lg ${installing || disableInstall ? 'opacity-50' : ''}`}
        onClick={install}
        disabled={installing || disableInstall}
      >
        {buttonText}
      </button>
    </div>
  )
}

export default Installation
