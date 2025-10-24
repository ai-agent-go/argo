import {
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Slider,
  Spin,
  Tooltip,
} from '@arco-design/web-react'
import {
  IconClose,
  IconExclamationCircleFill,
  IconQuestionCircle,
  IconRefresh,
} from '@arco-design/web-react/icon'
import {useAtom} from 'jotai'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import IconEmpty from '~/assets/empty.svg'
import CategoryList from '~/components/CategoryList'
import DownloadingIcon from '~/components/icons/DownloadingIcon'
import DownloadPauseIcon from '~/components/icons/DownloadPauseIcon'
import GarbageBin from '~/components/icons/GarbageBin'
import FormatValue from '~/components/ModelSelect/FormatValue'
import {createKnowledge, updateKnowledge} from '~/lib/apis/knowledge'
import {
  changeModelStatus,
  deleteModel,
  downloadHotModel,
  getModelList,
  ollamaServiceCheck,
  updateFailModel,
} from '~/lib/apis/models'
import {getModelProviders} from '~/lib/apis/settings'
import {currentWorkspace, selectKnowledge} from '~/lib/stores'
import {formatSize} from '~/lib/utils'
import {FAILED_MODEL_UPDATE_STATUS, STATUS_TYPE} from '~/pages/models/constants'

import ChooseFolder from '../ChooseFolder'
import {useKnowledgeListActions} from '../hooks'

export default function KnowledgeBaseModal({
  onSubmit,
  visible,
  setVisible,
  modalType,
}) {
  const {updateKnowledgeList} = useKnowledgeListActions()
  const [popupVisible, setPopupVisible] = useState(false)
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [$selectKnowledge, setSelectKnowledge] = useAtom(selectKnowledge)
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const [modelList, setModelList] = useState([])
  const [recommendModel, setRecommendModel] = useState(null)
  const [showDownloadSet, setShowDownloadSet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectModel, setSelectModel] = useState(null)
  const [downloadModelStatus, setDownloadModelStatus] = useState(null)
  const [failRecommendModel, setFailRecommendModel] = useState(null)
  const timer = useRef(null)

  const handleSubmit = async (val) => {
    if (loading) return
    if (downloadModelStatus) {
      Message.warning(
        t(
          'The embedded model is being downloaded and can only be used after the download is completed'
        )
      )
      return
    }
    if (
      selectModel?.model_name === recommendModel?.model_name &&
      !modelList?.length
    ) {
      Message.warning(
        t(
          'The current embedding model is not downloaded. It can be used only after the download is completed'
        )
      )
      return
    }

    setLoading(true)
    try {
      if (modalType === 'create') {
        await createKnowledge(val)
        Message.success(t('Knowledge created successfully'))
        form.clearFields()
      } else {
        await updateKnowledge({
          ...val,
          collection_name: $selectKnowledge.collection_name,
        })
        Message.success(t('Successfully modified knowledge base settings'))
        setVisible(false)
        updateKnowledgeList({
          ...val,
          collection_name: $selectKnowledge.collection_name,
        })
        setSelectKnowledge({
          ...val,
          collection_name: $selectKnowledge.collection_name,
        })
      }
      onSubmit()
    } catch (error) {
      Message.error(error.msg || 'Server error, try again later')
    } finally {
      setLoading(false)
    }
  }

  const serviceCheck = async () => {
    let serviceCheckError = ''
    try {
      const data = await getModelProviders($currentWorkspace.id)
      const ollamaArr = data.model_list.filter(
        (item) => item.provider === 'ollama'
      )
      try {
        await ollamaServiceCheck(ollamaArr[0].credentials.base_url)
        serviceCheckError = ''
      } catch (err) {
        serviceCheckError = 'Ollama service is not available'
      }
    } catch (err) {
      Message.error(err.msg)
      serviceCheckError = 'Ollama service is not available'
    }
    return serviceCheckError
  }

  const getDownloadInfo = (data, completeList) => {
    // 已有可使用的模型
    if (completeList.length) {
      setDownloadModelStatus(null)
      clearInterval(timer.current)
      return
    }
    const downloadingList = data?.model_list?.filter((item) => {
      const status = STATUS_TYPE[item.download_status]
      return status === 'downloading' || status === 'download_pause'
    })

    const recommendItem = downloadingList?.find((item) => {
      return (
        item.model_name === data?.recommend_model.embedding_model.model_name
      )
    })
    if (!downloadingList.length) {
      setDownloadModelStatus(null)
      clearInterval(timer.current)
      return
    }

    if (!recommendItem) {
      return
    }
    setDownloadModelStatus(recommendItem)
  }

  const getModelsInfo = async () => {
    const data = await getModelList({
      is_embeddings: true,
    })
    let listComplete = []
    if (data?.model_list && data?.model_list?.length > 0) {
      listComplete =
        data.model_list?.filter(
          (v) =>
            v.is_embeddings &&
            (v.download_status === 'all_complete' || v.provider !== 'ollama')
        ) || []
      setModelList(listComplete)
    }
    const model = data?.recommend_model?.embedding_model
    if (model) {
      // 保持前后一致将模型名拼接
      model.model_name = `${model.model_name}:${model.parameter}`
      setRecommendModel(model)
      // 判断推荐模型是否已下载失败
      const fail = data.model_list?.find(
        (v) =>
          STATUS_TYPE[v.download_status] === 'fail' &&
          v.model_name === model.model_name
      )
      setFailRecommendModel(fail || null)
    }
    getDownloadInfo(data, listComplete)
    return data
  }

  const getModels = async () => {
    if (timer.current) {
      clearInterval(timer.current)
    }
    getModelsInfo()
    timer.current = setInterval(async () => {
      getModelsInfo()
    }, 3000)
  }

  const downloadEmbeddingModel = async () => {
    // 查看ollama服务是否可用
    const serviceCheckError = await serviceCheck()
    if (serviceCheckError) {
      Message.warning(t(serviceCheckError))
      return
    }
    const {model_name} = recommendModel
    const successMessage = failRecommendModel?.download_status
      ? t('Add to download list')
      : t('Updated')
    const errorMessage = 'Server error, try again later'

    try {
      if (failRecommendModel) {
        // 下载失败后下载
        await updateFailModel({
          model_name,
          download_status:
            FAILED_MODEL_UPDATE_STATUS[failRecommendModel?.download_status],
        })
      } else {
        // 正常下载
        await downloadHotModel({
          ...recommendModel,
          model_name: `${model_name.split(':')[0]}`,
        })
      }

      Message.success(successMessage)
      await getModels()
    } catch (err) {
      Message.error(err.msg || errorMessage)
    }
  }

  const deleteModelHandler = async () => {
    try {
      const res = await deleteModel(downloadModelStatus?.model_name)

      if (res) {
        Message.success(t('Deleted'))
      }
      getModels()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return null
  }

  const changeDownloadProcess = async () => {
    downloadModelStatus.download_status =
      downloadModelStatus.download_status === 'downloading'
        ? 'download_pause'
        : 'downloading'
    try {
      await changeModelStatus(
        downloadModelStatus.model_name,
        downloadModelStatus.download_status
      )
      getModels()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const renderRecommendModelBtn = () => {
    if (
      selectModel?.model_name === recommendModel?.model_name &&
      !modelList.length &&
      !downloadModelStatus
    ) {
      if (failRecommendModel) {
        return (
          <div className="flex items-center ml-6 mr-2">
            <Tooltip content={failRecommendModel?.process_message}>
              <div className="text-[#EB5746] flex items-center text-[10px]">
                <IconExclamationCircleFill className="text-[#EB5746] text-[12px] mr-[2px]" />
                {t(failRecommendModel?.download_status)}
              </div>
            </Tooltip>
            <Tooltip content={t('Retry')}>
              <IconRefresh
                className="text-[#565759] w-5 h-5 mx-[10px]"
                onClick={() => {
                  downloadEmbeddingModel()
                }}
              />
            </Tooltip>
          </div>
        )
      }
      return (
        <div
          className="rounded-lg bg-[#133EBF] w-[140px] h-[46px] leading-[46px] text-center text-[#fff] text-[14px] font-500 ml-4 cursor-pointer"
          onClick={downloadEmbeddingModel}
        >
          {t('Download')}
        </div>
      )
    }
    if (
      downloadModelStatus &&
      selectModel?.model_name === recommendModel?.model_name
    ) {
      return (
        <div className="rounded-lg overflow-hidden bg-[#F2F6FF] w-[140px] h-[46px] leading-[46px] text-center text-[#133EBF] text-[14px] font-400 ml-4 cursor-pointer relative">
          <div
            className="absolute bg-[#133EBF] opacity-40 top-0 left-0 h-full"
            style={{
              width: `${downloadModelStatus?.download_progress}%`,
            }}
          />
          <span className="font-500">
            {downloadModelStatus?.download_progress}%
          </span>
          {downloadModelStatus?.download_speed
            ? ` (${formatSize(downloadModelStatus?.download_speed)}/s)`
            : ''}
          {showDownloadSet ? (
            <div className="absolute top-0 left-0 w-full h-full flex gap-4 items-center justify-center bg-[#03060E] opacity-80">
              <Tooltip
                content={
                  downloadModelStatus.download_status === 'download_pause'
                    ? t('Continue')
                    : t('Pause')
                }
              >
                <div onClick={changeDownloadProcess}>
                  {downloadModelStatus.download_status === 'download_pause' ? (
                    <DownloadPauseIcon className="text-[#fff] w-4 h-4" />
                  ) : (
                    <DownloadingIcon className="text-[#fff] w-5 h-5" />
                  )}
                </div>
              </Tooltip>
              <Tooltip content={t('Delete')}>
                <div onClick={deleteModelHandler}>
                  <GarbageBin strokeWidth="2" className="text-[#fff] w-4 h-4" />
                </div>
              </Tooltip>
            </div>
          ) : null}
        </div>
      )
    }
    return null
  }

  useEffect(() => {
    getModels()
  }, [])

  useEffect(() => {
    if (!visible) return
    if (modalType === 'create') {
      form.setFieldsValue({
        chunk_size: 500,
        chunk_overlap: 50,
        top_k: 5,
        embedding_model: modelList[0]?.model_name || recommendModel.model_name,
        provider: modelList[0]?.provider || recommendModel.provider,
      })
      setSelectModel(modelList[0] || recommendModel)
    } else {
      form.setFieldsValue({
        chunk_size: 500,
        chunk_overlap: 50,
        top_k: 5,
        ...$selectKnowledge,
      })
      setSelectModel({model_name: $selectKnowledge.embedding_model})
    }
  }, [visible])

  return (
    <Modal
      maskClosable={false}
      visible={visible}
      footer={null}
      onCancel={() => {
        setPopupVisible(false)
        setVisible(false)
      }}
      unmountOnExit
      closeIcon={
        <IconClose type="close" style={{fontSize: '20px', color: '#565759'}} />
      }
      className="px-[10px] py-[6px] rounded-xl relative w-[520px]"
    >
      <div className="flex items-center gap-1 font-600 text-[18px] mb-[30px]">
        {modalType === 'create' ? t('Create Knowledge') : t('Edit Knowledge')}
        <Tooltip
          content={
            <div className="h-[200px] overflow-y-scroll">
              {t('Embedding Model')}:{' '}
              {t(
                'Converts text into computer-understandable vectors to identify content similarity. Do not attempt to use models from other categories as embedding models.'
              )}
              <br />
              {t('Similarity Threshold')}:{' '}
              {t(
                'The score boundary for determining whether a user query is relevant to the knowledge base. Values above this threshold are considered a successful match.An appropriate value needs to be selected based on the answering effect of the large model.'
              )}
              <br />
              {t('Chunk Size')}:{' '}
              {t(
                'The length of each text segment when splitting long texts. Balances information integrity and computational efficiency.'
              )}
              <br />
              {t('Chunk Overlap')}:{' '}
              {t(
                'The amount of overlapping content between adjacent text chunks. Prevents critical information from being split and lost. Excessive overlap consumes additional tokens during vectorization.'
              )}
              <br />
              {t('Top K')}:{' '}
              {t(
                'The maximum number of most relevant results retrieved from the knowledge library per query. Higher values increase token consumption for each model response.'
              )}
            </div>
          }
        >
          <IconQuestionCircle className="ml-1 text-[#565759]" />
        </Tooltip>
      </div>
      <Spin loading={loading}>
        <Form
          form={form}
          onSubmit={handleSubmit}
          layout="vertical"
          style={{height: '550px', overflowY: 'auto', overflowX: 'hidden'}}
        >
          <Form.Item
            label={t('Knowledge Name')}
            field="knowledge_name"
            rules={[
              {
                required: true,
                message: t('Please enter', {name: t('Knowledge Name')}),
              },
            ]}
          >
            <Input
              type="text"
              maxLength={30}
              className=" px-5 py-3 rounded-2xl w-full text-sm outline-none bg-[#F9F9F9]"
              placeholder={t('Knowledge Name')}
            />
          </Form.Item>
          <Form.Item
            label={t('Description')}
            field="description"
            rules={[
              {
                required: true,
                message: t('Please enter', {name: t('Description')}),
              },
            ]}
          >
            <Input
              type="text"
              maxLength={100}
              className=" px-5 py-3 rounded-2xl w-full text-sm outline-none bg-[#F9F9F9]"
              placeholder={t('description')}
            />
          </Form.Item>
          <Form.Item field="provider" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label={t('EmbeddingModel')}
            field="embedding_model"
            rules={[
              {
                required: true,
                message: t('Please select an embedding model'),
              },
            ]}
          >
            <div className="flex items-center">
              <Select
                renderFormat={(m, v: any) => {
                  return <FormatValue value={v} modelList={modelList} />
                }}
                popupVisible={popupVisible}
                value={selectModel?.model_name}
                className={`flex-1 overflow-hidden rounded-2xl w-full bg-[#F9F9F9] text-sm outline-none h-[46px] py-[7px] ${
                  downloadModelStatus &&
                  selectModel?.model_name === recommendModel?.model_name
                    ? 'pointer-events-none'
                    : ''
                }`}
                bordered={false}
                onClick={() => setPopupVisible((pre) => !pre)}
                onChange={(e) => {
                  setPopupVisible(false)
                  setSelectModel(e)
                  form.setFieldsValue({
                    embedding_model: e.model_name,
                    provider: e.provider,
                  })
                }}
                dropdownMenuStyle={{
                  maxHeight: '227px',
                }}
                disabled={
                  downloadModelStatus &&
                  selectModel?.model_name === recommendModel?.model_name
                }
              >
                {modelList.length ? (
                  modelList.map((model) => (
                    <Select.Option value={model} key={model.id}>
                      <div className="flex items-center">
                        <div className="relative flex items-center px-2 h-8 rounded-lg cursor-pointer">
                          <img
                            alt="model-icon"
                            src={model.icon_url}
                            className="w-auto h-4 mr-1.5"
                          />
                        </div>
                        <Tooltip content={model.model_name}>
                          <div className="mr-4 max-w-[80%] truncate">
                            {model.model_name}
                          </div>
                        </Tooltip>
                        <CategoryList
                          list={model?.category?.category_label?.category || []}
                        />
                      </div>
                    </Select.Option>
                  ))
                ) : (
                  <div className="mx-4 my-2">
                    <div>
                      <div className="text-[#565759] text-[12px]">
                        {t('To be downloaded')}
                      </div>
                      <Select.Option
                        value={recommendModel?.model_name}
                        key="recommend"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectModel(recommendModel)
                          setPopupVisible(false)
                          form.setFieldsValue({
                            embedding_model: recommendModel.model_name,
                            provider: recommendModel.provider,
                          })
                        }}
                      >
                        <div className="flex items-center cursor-pointer hover:bg-[#F9F9F9]">
                          <span className="mr-4">
                            {recommendModel?.model_name}
                          </span>
                        </div>
                      </Select.Option>
                    </div>
                    <div className="mt-[10px]">
                      <div className="text-[#565759] text-[12px]">
                        {t('Existing model')}
                      </div>
                      <div className="flex flex-col gap-3 items-center justify-center mt-[14px]">
                        <img src={IconEmpty} className="w-[60px] h-[60px]" />
                        <div className="mb-5 text-[#565759] text-[12px] text-center">
                          {t('noModelPart1')}
                          <Link
                            className="text-[#133EBF] cursor-pointer"
                            to={`/space/${$currentWorkspace.id}/models`}
                          >
                            {t('modelPage')}
                          </Link>
                          {t('noModelPart2')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Select>
              <div
                onMouseEnter={() => setShowDownloadSet(true)}
                onMouseLeave={() => setShowDownloadSet(false)}
              >
                {renderRecommendModelBtn()}
              </div>
            </div>
          </Form.Item>
          <Form.Item
            field="similarity_threshold"
            label={t('Similarity threshold')}
          >
            <Slider showInput max={1} step={0.01} className="mx-2" />
          </Form.Item>
          <Form.Item field="folder" label={t('Bind File Directory')}>
            <ChooseFolder />
          </Form.Item>
          <Form.Item
            label={t('Chunk Size')}
            field="chunk_size"
            rules={[
              {
                required: true,
                message: t('Please enter', {name: t('Chunk Size')}),
              },
            ]}
            initialValue={500}
          >
            <InputNumber
              className="h-[46px] rounded-2xl w-full text-sm bg-[#F9F9F9]"
              max={10000}
            />
          </Form.Item>
          <Form.Item
            label={t('Chunk Overlap')}
            field="chunk_overlap"
            rules={[
              {
                required: true,
                message: t('Please enter', {name: t('Chunk Overlap')}),
              },
            ]}
            initialValue={50}
          >
            <InputNumber className="h-[46px] rounded-2xl w-full text-sm bg-[#F9F9F9]" />
          </Form.Item>
          <Form.Item
            label={t('Top K')}
            field="top_k"
            rules={[
              {
                required: true,
                message: t('Please enter', {name: t('Top K')}),
              },
            ]}
            initialValue={5}
          >
            <InputNumber
              className="h-[46px] rounded-2xl w-full text-sm bg-[#F9F9F9]"
              max={100}
            />
          </Form.Item>
        </Form>
        <div className="flex items-center justify-end mt-1">
          <div
            className="border-[0.5px] border-[#EBEBEB] w-[218px] mr-6 cursor-pointer h-[42px] rounded-[8px] box-border text-[#565759] text-[16px] leading-[42px] text-center"
            onClick={() => {
              setPopupVisible(false)
              setVisible(false)
            }}
          >
            {t('Cancel')}
          </div>
          <div
            className="bg-[#133EBF] w-[218px] h-[42px] cursor-pointer  rounded-[8px] box-border text-white text-[16px] leading-[42px] text-center"
            onClick={() => {
              form.submit()
            }}
          >
            {t('Submit')}
          </div>
        </div>
      </Spin>
    </Modal>
  )
}
