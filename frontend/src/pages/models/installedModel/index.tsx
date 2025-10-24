import {Message, Tooltip} from '@arco-design/web-react'
import {
  IconCheckCircleFill,
  IconExclamationCircleFill,
  IconLoading,
  IconRefresh,
} from '@arco-design/web-react/icon'
import dayjs from 'dayjs'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import CategoryList from '~/components/CategoryList'
import DownloadingIcon from '~/components/icons/DownloadingIcon'
import DownloadPauseIcon from '~/components/icons/DownloadPauseIcon'
import EllipsisHorizontal from '~/components/icons/EllipsisHorizontal'
import GarbageBin from '~/components/icons/GarbageBin'
import {showModal} from '~/components/Modal'
import OverflowTooltip from '~/components/OverflowTooltip'
import {
  changeModelStatus,
  deleteModel,
  getModelList,
  setModelCategory,
  updateFailModel,
} from '~/lib/apis/models'
import {formatSize} from '~/lib/utils'

import ConfirmAction from '../components/ConfirmAction'
import ModelMenu from '../components/ModelMenu'
import ModelSetting from '../components/ModelSetting'
import {FAILED_MODEL_UPDATE_STATUS, STATUS_TYPE} from '../constants'
import FailConnect from '../images/failConnect.png'
import ModelsSpeedup from '../images/modelsSpeedup'

function InstalledModelPage({LLMConnectError, refreshInstall}) {
  const timer = useRef(null)
  const {t} = useTranslation()
  const [models, setModels] = useState([])
  const [cutOffModel, setCutOffModel] = useState(null)

  const getModelsInfo = async () => {
    const data = await getModelList()
    setModels(data.model_list.filter((v) => v.provider === 'ollama'))
    return data
  }

  const getModels = async () => {
    if (timer.current) {
      clearInterval(timer.current)
    }
    getModelsInfo()
    timer.current = setInterval(async () => {
      const data = await getModelsInfo()
      const downloadingList = data?.model_list?.filter(
        (item) =>
          item.download_status &&
          STATUS_TYPE[item.download_status] === 'downloading'
      )
      if (downloadingList.length === 0) {
        clearInterval(timer.current)
      }
    }, 3000)
  }

  const handleSubmitModelSet = async (values, model, type, template) => {
    try {
      await setModelCategory({
        model_name: model?.model_name,
        model_type: type,
        category: values,
        modelfile_content: template,
      })
      getModels()
      Message.success(t('Set Success'))
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const handleSetting = (model) => {
    showModal(
      ({closeMask, getPopupContainer}) => (
        <ModelSetting
          handleSubmit={(v, type, template) =>
            handleSubmitModelSet(v, model, type, template)
          }
          model={model}
          value={model?.category?.category_label}
          getPopupContainer={getPopupContainer}
          handleClose={closeMask}
        />
      ),
      {
        maskStyle: {
          background: 'transparent',
        },
        maskClosable: false,
      }
    )
  }

  const deleteModelHandler = async (model) => {
    if (!model) {
      Message.error(t('You cannot delete a base model'))
      return null
    }
    try {
      const res = await deleteModel(model.model_name)

      if (res) {
        Message.success(t('Deleted'))
      }
      getModels()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return null
  }

  const handleUpdateModel = async (model) => {
    if (!model) {
      Message.error(t('You cannot update a base model'))
      return null
    }
    try {
      const res = await updateFailModel({
        model_name: model.model_name,
        download_status: FAILED_MODEL_UPDATE_STATUS[model.download_status],
      })

      if (res) {
        Message.success(t('Updated'))
      }
      getModels()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return null
  }

  const changeDownloadProcess = async (item) => {
    item.download_status =
      item.download_status === 'downloading' ? 'download_pause' : 'downloading'
    try {
      await changeModelStatus(item.model_name, item.download_status)
      getModels()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  useEffect(() => {
    getModels()
    return () => {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
    }
  }, [refreshInstall])

  const renderDownloadStatus = (item) => {
    const {download_status, modelfile_content = null, category = null} = item
    if (download_status === 'all_complete') {
      return (
        <div className="flex gap-[10px] items-center">
          <div>
            <Tooltip
              content={
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetting(item)
                  }}
                >
                  {t(
                    'The model template of the current model is empty, which may cause the model to fail to chat normally. Click here or in the settings to edit the model template'
                  )}
                </div>
              }
            >
              {!modelfile_content &&
              category?.category_label?.type === 'chat' ? (
                <div className="text-[#EB5746] flex gap-[2px] items-center text-[10px]">
                  <IconExclamationCircleFill className="text-[#EB5746] text-[10px]" />
                  {t('Model template is empty')}
                </div>
              ) : null}
            </Tooltip>
          </div>
          <div className="rounded-[8px] bg-[#F9F9F9] py-[3px] px-4 flex flex-col items-center justify-center">
            <div className="flex items-center text-[#03060E] text-[10px]">
              <IconCheckCircleFill className="text-[#03060E] mr-[2px]" />
              {t('installed')}
            </div>
            <div className="text-[8px] text-[#AEAFB3] overflow-hidden text-ellipsis line-clamp-1">
              size: {(item.size / 1024 / 1024 / 1024).toFixed(2)}G
            </div>
          </div>
        </div>
      )
    }
    if (
      download_status === 'downloading' ||
      download_status === 'download_pause'
    ) {
      return (
        <div className="flex rounded-[6px] text-[10px] text-[#03060E] items-center">
          <Tooltip content={`${item.process_message}`}>
            <div>
              {item.download_status === 'downloading' && (
                <IconLoading className="text-[12px] mr-[2px] text-[#03060E] font-500" />
              )}
              {item.download_status === 'downloading'
                ? t('Downloading')
                : t('Paused')}
              : {item.download_progress}%
              <div className="flex text-[#565759]">
                {item.download_speed
                  ? ` （${formatSize(item.download_speed)}/s）`
                  : ''}
                {Object.keys(item.download_info || {}).length > 0 ? (
                  <div className="flex items-center mx-[2px] text-[#133EBF] text-[8px]">
                    <ModelsSpeedup />+
                    {(
                      (((item.download_info.p2p_size +
                        item.download_info.p2s_size +
                        item.download_info.dcdn_size) /
                        (item.download_info.p2p_size +
                          item.download_info.p2s_size +
                          item.download_info.dcdn_size +
                          item.download_info.origin_size)) *
                        item.download_speed) /
                      1024 /
                      1024
                    ).toFixed(2)}
                    M/s
                  </div>
                ) : null}
              </div>
            </div>
          </Tooltip>

          <Tooltip
            content={`${item.download_status === 'downloading' ? t('Pause') : t('Continue')}`}
          >
            <div className="mx-2" onClick={() => changeDownloadProcess(item)}>
              {item.download_status === 'downloading' ? (
                <DownloadingIcon />
              ) : (
                <DownloadPauseIcon className="text-[#565759] w-4 h-4" />
              )}
            </div>
          </Tooltip>
        </div>
      )
    }
    if (FAILED_MODEL_UPDATE_STATUS[item.download_status]) {
      return (
        <div className="flex items-center">
          <Tooltip content={item.process_message}>
            <div className="text-[#EB5746] flex items-center text-[10px]">
              <IconExclamationCircleFill className="text-[#EB5746] text-[10px]" />
              {t(item.download_status)}
            </div>
          </Tooltip>
          <Tooltip content={t('Retry')}>
            <IconRefresh
              className="text-[#565759] w-5 h-5 mx-2"
              onClick={() => {
                handleUpdateModel(item)
              }}
            />
          </Tooltip>
        </div>
      )
    }
    return (
      <div className="flex rounded-[6px] bg-[#F9F9F9] p-[6px] text-[10px] mx-1">
        <Tooltip content={item.process_message}>
          <div>{t(item.download_status)}</div>
        </Tooltip>
      </div>
    )
  }

  return (
    <div>
      {!LLMConnectError ? (
        <div
          className="border-[0.5px] border-[#ebebeb] p-4 rounded-lg gap-4"
          id="model-list"
        >
          {models.map((model, index) => (
            <React.Fragment key={model.model_name}>
              <div className=" flex cursor-pointer w-full rounded-xl">
                <div className=" flex flex-1 space-x-3.5 cursor-pointer w-full">
                  <div
                    className={` flex-1 self-center ${(model?.info?.meta?.hidden ?? false) ? 'text-gray-500' : ''}`}
                  >
                    <div className="rounded flex gap-[6px] items-center mb-[2px]">
                      <div className="font-500 leading-[22px] text-[14px] text-[#03060E]  text-ellipsis overflow-hidden line-clamp-1">
                        <OverflowTooltip>{model.model_name}</OverflowTooltip>
                      </div>
                      {model?.category?.extra_label.map((item) => (
                        <div
                          key={item}
                          className="py-[2px] px-[6px] bg-[#296FFF26] text-[#296FFF] rounded text-[10px] h-[18px]"
                        >
                          {item}
                        </div>
                      ))}

                      {model.parameter ? (
                        <div className="py-[2px] px-[6px] bg-[#6229FF26] text-[#6229FF] rounded text-[10px] h-[18px]">
                          {model.parameter}
                        </div>
                      ) : null}
                      <CategoryList
                        list={model.category?.category_label?.category}
                      />
                    </div>
                    <div className="leading-[18px] text-[#565759] text-[12px]">
                      {model.description}
                    </div>
                    <div className=" text-[10px] overflow-hidden text-ellipsis line-clamp-1 text-[#AEAFB3]">
                      {`${t('download at')}: ${dayjs.unix(model.created_at).format('YYYY-MM-DD HH:mm:ss')}`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row self-center items-center">
                  {renderDownloadStatus(model)}
                  {model.download_status === 'all_complete' ? (
                    <ModelMenu
                      settingHandler={() => handleSetting(model)}
                      deleteHandler={() => {
                        setCutOffModel(model)
                      }}
                    >
                      <button
                        aria-label="icon"
                        className="self-center w-fit text-sm p-1.5 hover:bg-black/5 rounded-xl"
                      >
                        <EllipsisHorizontal className="size-5" />
                      </button>
                    </ModelMenu>
                  ) : (
                    <Tooltip content={t('Delete')}>
                      <div
                        onClick={() => {
                          setCutOffModel(model)
                        }}
                      >
                        <GarbageBin strokeWidth="2" />
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>
              {index < models.length - 1 && (
                <div className="border-t-[0.5px] border-[#ebebeb] w-full my-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="flex items-center flex-col">
          <img src={FailConnect} alt="" className="mb-[10px] h-[300px]" />
          <div className="text-[#03060E] font-600 text-[24px] leading-9">
            {t('Failed to connect')}
          </div>
          <div className="text-[#565759] text-[16px] leading-5">
            {t(
              'Ollama service is not available, so unable to view installed models for the moment.'
            )}
          </div>
        </div>
      )}

      <ConfirmAction
        onClose={() => setCutOffModel(null)}
        onOK={() => {
          setCutOffModel(null)
          deleteModelHandler(cutOffModel)
        }}
        visible={cutOffModel}
        text={t('This action cannot be undone.Do you wish to continue?')}
      />
    </div>
  )
}

export default InstalledModelPage
