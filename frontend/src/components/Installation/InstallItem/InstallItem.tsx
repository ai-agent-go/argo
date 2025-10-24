import {Message, Tooltip} from '@arco-design/web-react'
import {
  IconCaretDown,
  IconExclamationCircleFill,
  IconRefresh,
} from '@arco-design/web-react/icon'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import DownloadingIcon from '~/components/icons/DownloadingIcon'
import DownloadPauseIcon from '~/components/icons/DownloadPauseIcon'
import GarbageBin from '~/components/icons/GarbageBin'
import ModelSelect from '~/components/ModelSelect'
import {changeModelStatus, deleteModel} from '~/lib/apis/models'
import {currentWorkspace} from '~/lib/stores'
import {STATUS_TYPE} from '~/pages/models/constants'

import './InstallItem.less'

const SELECT_GROUP_TEXT = {
  provider: 'To be configured',
  download: 'To be downloaded',
}

function InstallItem({
  text,
  item = {
    provider_status: '',
    provider: '',
    model_name: '',
    process_message: '',
  },
  status,
  speed,
  percent,
  install,
  getStatus,
  modeList = [],
  defaultModel = null,
  handleChangeModel = null,
  installing,
  addModel = null,
}) {
  const history = useHistory()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [modelValue, setModelValue] = useState(defaultModel)
  const [modelStatus, setModelStatus] = useState(status)

  const changeModelSelect = (value) => {
    if (!value || !defaultModel) return
    if (value.name === defaultModel && value.provider === item.provider) {
      setModelStatus(status)
    } else {
      setModelStatus(value.provider === 'ollama' ? 'all_complete' : 'available')
    }
    if (handleChangeModel) {
      handleChangeModel(value)
    }
  }

  const changeModel = (value) => {
    setModelValue(value)
    if (value === defaultModel) {
      changeModelSelect({name: value, provider: item.provider})
    } else {
      const val = modeList.find((v) => v.id === value)
      changeModelSelect({name: val.model_name, provider: val.provider})
    }
  }

  const selectModel = () => {
    if (!modeList.length && !defaultModel) {
      return defaultModel
    }
    let type = ''
    if (item.provider_status === 'not_init' && modelValue === defaultModel) {
      type = 'provider'
    } else if (
      STATUS_TYPE[modelStatus] === 'delete' ||
      STATUS_TYPE[modelStatus] === 'incompatible'
    ) {
      type = 'download'
    }
    return (
      <ModelSelect
        className="w-[183px] rounded-md bg-[#EBEBEB] select"
        disabled={installing}
        value={modelValue}
        defaultValue={addModel}
        modelList={modeList}
        placeholder="Select model"
        onChange={(value) => {
          changeModel(value.id || value)
        }}
        groupText={SELECT_GROUP_TEXT[type]}
        bordered={false}
        dropdownMenuClassName="w-[265px] bg-white z-50 py-1"
        suffixIcon={<IconCaretDown className="text-[#7A7C81]" />}
      />
    )
  }

  const handleDeleteModel = async () => {
    try {
      const res = await deleteModel(item.model_name)

      if (res) {
        Message.success(t('Deleted'))
      }
      getStatus()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const pauseOrContinue = async () => {
    try {
      await changeModelStatus(
        modelValue,
        status === 'download_pause' ? 'downloading' : 'download_pause'
      )
      getStatus()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const renderItemStatus = () => {
    const statusComponents = {
      imported: (
        <span className="text-[#565759] text-[14px] min-w-fit">
          {t('Imported')}
        </span>
      ),
      not_imported: (
        <span className="text-[#565759] text-[14px] min-w-fit">
          {t('Not imported')}
        </span>
      ),
      importing: (
        <div className="flex gap-[10px] items-center">
          <Tooltip content={item.process_message}>
            <span className="text-13 text-[#133EBF] mr-1">{`${percent}%`}</span>
            <span className="text-13">{speed}</span>
          </Tooltip>
        </div>
      ),
      delete_or_incompatible: (
        <div className="text-[#EB5746] flex items-center">
          {STATUS_TYPE[modelStatus] === 'incompatible' && (
            <Tooltip content={item.process_message}>
              <IconExclamationCircleFill className="w-4 h-4 mr-1" />
            </Tooltip>
          )}
          <span className="text-14">{t('Not downloaded')}</span>
        </div>
      ),
      fail: (
        <div className="flex gap-[10px] items-center">
          <div className="text-[#EB5746] flex items-center">
            <Tooltip content={status}>
              <IconExclamationCircleFill className="w-4 h-4" />
            </Tooltip>
            <span className="text-14 ml-1">{t('Download fail')}</span>
          </div>
          <Tooltip content={t('Reinstall')}>
            <IconRefresh
              className="text-14 ml-1 text-[#565759] w-4 h-4"
              onClick={install}
            />
          </Tooltip>
          <Tooltip content={t('Delete')}>
            <div onClick={handleDeleteModel}>
              <GarbageBin strokeWidth="2" className="text-[#565759] w-4 h-4" />
            </div>
          </Tooltip>
        </div>
      ),
      configured: (
        <div className="text-[#565759] text-[14px] min-w-fit">
          {t('Configured')}
        </div>
      ),
      set_provider: (
        <div
          className="text-[#133EBF] text-[14px] cursor-pointer"
          onClick={() => {
            const path =
              modelValue.provider === 'openai-api-compatible'
                ? `/space/${$currentWorkspace.id}/models`
                : `/space/${$currentWorkspace.id}/models?provider=${modelValue.provider}&customName=''`
            history[
              modelValue.provider === 'openai-api-compatible'
                ? 'replace'
                : 'push'
            ](path)
          }}
        >
          {t('Set provider')}
        </div>
      ),
      downloaded: (
        <span className="text-[#565759] text-[14px] min-w-fit">
          {t('Downloaded')}
        </span>
      ),
      downloading: (
        <div className="flex gap-[10px] items-center">
          <Tooltip content={item.process_message}>
            <div className="flex">
              <span className="text-13 text-[#133EBF] mr-1">{`${percent}%`}</span>
              <span className="text-13 text-[#565759]">{speed}</span>
            </div>
          </Tooltip>
          <Tooltip
            content={status === 'download_pause' ? t('Continue') : t('Pause')}
          >
            <div onClick={pauseOrContinue}>
              {status === 'download_pause' ? (
                <DownloadPauseIcon className="text-[#565759] w-4 h-4" />
              ) : (
                <DownloadingIcon />
              )}
            </div>
          </Tooltip>
          <Tooltip content={t('Delete')}>
            <div onClick={handleDeleteModel}>
              <GarbageBin strokeWidth="2" className="text-[#565759] w-4 h-4" />
            </div>
          </Tooltip>
        </div>
      ),
    }

    if (status === 'imported') return statusComponents.imported
    if (status === 'importing') return statusComponents.importing
    if (status === 'not_imported') return statusComponents.not_imported

    if (
      STATUS_TYPE[modelStatus] === 'delete' ||
      STATUS_TYPE[modelStatus] === 'incompatible'
    ) {
      return statusComponents.delete_or_incompatible
    }

    if (STATUS_TYPE[modelStatus] === 'fail') return statusComponents.fail

    if (
      modelStatus === 'available' ||
      (item.provider_status === 'available' && modelValue === defaultModel)
    ) {
      return statusComponents.configured
    }

    if (item.provider_status === 'not_init' && modelValue === defaultModel) {
      return statusComponents.set_provider
    }

    if (STATUS_TYPE[modelStatus]?.includes('complete')) {
      return statusComponents.downloaded
    }

    return statusComponents.downloading
  }

  useEffect(() => {
    if (item.model_name) {
      changeModelSelect({name: item.model_name, ...item})
    } else {
      changeModelSelect({name: defaultModel})
    }
  }, [status])

  return (
    <div className="flex items-center gap-4 h-12 w-[470px] ">
      <div className="rounded-lg px-2 border-[0.5px] flex-auto flex justify-between h-[48px] items-center leading-4">
        <div className="flex flex-col justify-center max-w-[320px]">
          <div className="flex items-center gap-1">
            <span className="mr-2">
              {text}
              {!modeList.length || !defaultModel ? '' : ':'}
            </span>
            {selectModel()}
          </div>
        </div>

        {renderItemStatus()}
      </div>
    </div>
  )
}

export default InstallItem
