import {Form, Image, Input, Message, Tooltip} from '@arco-design/web-react'
import {IconCloseCircle} from '@arco-design/web-react/icon'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import FileIcons from '~/components/icons/FileIcons'
import ModelSelect from '~/components/ModelSelect'
import UploadFileListIcon from '~/components/upload/UploadFileListIcon'
import UploadPngIcon from '~/components/upload/UploadPngIcon'
import {uploadDocument} from '~/lib/apis/documents'
import {getKnowledgeDetailInfo} from '~/lib/apis/knowledge'
import {uploadFiles} from '~/lib/apis/upload'

import ToolSelector from './McpTool'

function MessageInput({
  handleSubmit,
  loading,
  upLoadDisable = false,
  showUpload = false,
  disabled = false,
  changeTools = () => {},
  modelValue,
  isShowModel = true,
  modelList = [],
  detail,
  changeModel = () => {},
  editPlanMode = null,
  onEditPlanModeChange = () => {},
  handleChangeDeepSearch,
}: any) {
  const timer = useRef(null)
  const inputRef = useRef(null)
  const filelistRef = useRef([])
  const uploading = useRef(false)
  const {t} = useTranslation()
  const [sendMsg, setSendMsg] = useState('')
  const [filelist, setFileList] = useState([])
  const [modelInfo, setModelInfo] = useState(null)

  const handleSubmitChat = () => {
    const finalMessage = editPlanMode ? `[${editPlanMode}] ${sendMsg}` : sendMsg
    handleSubmit({
      message: finalMessage,
      fileList: filelistRef.current
        .filter((v) => v.document_status === 3)
        .map((v) => ({
          ...v,
          id: v.id || v.partition_name,
          type: v.type || 'document',
        })),
    })
    setSendMsg('')
    setFileList([])
    filelistRef.current = []
    // 发送后退出Edit plan模式
    if (editPlanMode) {
      onEditPlanModeChange(null)
    }
  }

  const getDetailValues = async (list) => {
    try {
      const data = await getKnowledgeDetailInfo({
        collection_name: 'temp',
        partition_names: list.map((v) => v.partition_name),
      })
      return data
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return {}
  }

  const mateDocumentDownloadStatus = async (list) => {
    const data = await getDetailValues(list)
    // TODO 匹配下载进度
    const {partition_info = []} = data
    const downloadingList = partition_info?.filter(
      (item) => item.document_status === 1
    )
    const newlist = list.map((v) => {
      const idx = partition_info.findIndex(
        (item) => item.partition_name === v.partition_name
      )
      if (idx > -1) {
        return {
          ...v,
          document_status: partition_info[idx].document_status,
          file_type: partition_info[idx].file_type,
          msg: partition_info[idx].msg,
          progress: partition_info[idx].progress,
        }
      }
      return v
    })
    setFileList(newlist)
    filelistRef.current = newlist

    if (downloadingList.length === 0) {
      clearInterval(timer.current)
      uploading.current = false
    }
  }

  const getFileListProgress = async (list) => {
    if (timer.current) {
      clearInterval(timer.current)
    }
    mateDocumentDownloadStatus(list)
    if (list.length === 0) {
      uploading.current = false
      return
    }
    uploading.current = true
    timer.current = setInterval(async () => {
      mateDocumentDownloadStatus(list)
    }, 5000)
  }

  const handleDeleteItem = (file) => {
    const idx = filelistRef.current.findIndex((v) => v.uid === file.uid)
    const list = filelistRef.current
    if (idx > -1) {
      list.splice(idx, 1)
      getFileListProgress(list)
      setFileList([...list])
      filelistRef.current = [...list]
    }
  }

  const handleSetImg = async (vals) => {
    try {
      const {files} = await uploadFiles(vals.map((v) => v.originFile))
      // const {success_file_names, success_partition_names} = data
      // const list = vals.map((file) => {
      //   const idx = success_file_names.findIndex((v) => v === file.name)
      //   if (idx > -1) {
      //     return {
      //       ...file,
      //       partition_name: success_partition_names[idx],
      //       document_status: 1,
      //       progress: 0,
      //     }
      //   }
      //   return file
      // })
      const newImgs = files.map((v, idx) => ({
        ...vals[idx],
        type: 'image',
        name: v.file_name,
        id: v.file_id,
        url: v.file_url,
        file_type: 'png',
        transfer_method: 'local_file',
        document_status: 3,
      }))
      filelistRef.current = [...filelistRef.current, ...newImgs]
      setFileList(filelistRef.current)
      getFileListProgress(filelistRef.current)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const handleSetFiles = async (vals) => {
    try {
      const data = await uploadDocument({
        files: vals.map((v) => v.originFile),
        collection_name: 'temp',
      })
      const {success_file_names, success_partition_names} = data
      const list = vals.map((file) => {
        const idx = success_file_names.findIndex((v) => v === file.name)
        if (idx > -1) {
          return {
            ...file,
            type: 'document',
            partition_name: success_partition_names[idx],
            document_status: 1,
            progress: 0,
          }
        }
        return file
      })
      filelistRef.current = [...filelistRef.current, ...list]
      setFileList(filelistRef.current)
      getFileListProgress(filelistRef.current)
    } catch (err) {
      Message.error(t(err.msg) || 'Server error, try again later')
    }
  }

  const getModelInfo = () => {
    if (modelList.length > 0) {
      const info = modelList.find(
        (v) =>
          v.model_name === modelValue?.name &&
          v.provider === modelValue?.provider
      )
      if (info) {
        setModelInfo({...info})
      }
    }
  }

  useEffect(() => {
    uploading.current = upLoadDisable
    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!modelValue) {
      setModelInfo(null)
    }
    if (
      modelValue &&
      modelList.length > 0 &&
      (modelValue.name !== modelInfo?.model_name ||
        modelValue?.provider !== modelInfo?.provider)
    ) {
      getModelInfo()
    }
  }, [modelValue, modelList])

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [loading])

  useEffect(() => {
    // 当进入Edit plan模式时，聚焦到输入框
    if (editPlanMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editPlanMode])

  const renderDownloadStatus = (item) => {
    if (item.document_status === 1) {
      return `waiting - ${item.progress * 100}%`
    }
    if (item.document_status === 2) {
      return 'fail'
    }
    if (item.document_status === 3) {
      return 'finish'
    }
    return ''
  }
  const isVision = modelInfo?.category?.category_label?.category?.find(
    (v) => v.category === 'vision'
  )

  return (
    <div className="z-50">
      <div className="pb-[30px] inset-x-0 mx-auto">
        <Form onSubmit={handleSubmitChat}>
          <div className=" bg-[#F9F9F9] rounded-xl p-[14px]">
            {/* Edit Plan Mode Indicator */}
            {editPlanMode && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium text-blue-700">
                  {t('Edit Plan Mode')}
                </span>
                <button
                  type="button"
                  onClick={() => onEditPlanModeChange(null)}
                  className="ml-auto text-blue-500 hover:text-blue-700 transition-colors"
                  aria-label="Exit edit plan mode"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            {filelist.length > 0 ? (
              <div className="grid py-1 grid-cols-2 gap-2 max-h-[144px] overflow-scroll no-scrollbar">
                {filelist.map((file) => (
                  <div className="relative group" key={file.uid}>
                    <Tooltip
                      content={file.document_status === 2 ? file.msg : ''}
                    >
                      <div className="h-[62px] flex items-center gap-[10px] px-[10px] py-[13px] rounded-xl border border-[#EBEBEB] bg-white box-border">
                        {file.name?.split('.').pop() !== 'png' ? (
                          <FileIcons
                            type={file.name?.split('.').pop()}
                            className="w-9 h-9"
                          />
                        ) : (
                          <Image
                            width={42}
                            height={42}
                            src={file.url}
                            className="overflow-hidden"
                          />
                        )}
                        <div className="flex flex-col justify-center ">
                          <div className="text-[14px] font-medium line-clamp-1 text-[#03060E] font-500">
                            {file.name}
                          </div>
                          {file.file_type === 'png' ? (
                            <div className="text-[#AEAFB3] text-[10px] mt-[3px]">
                              Image {renderDownloadStatus(file)}
                            </div>
                          ) : (
                            <div className="text-[#AEAFB3] text-[10px] mt-[3px]">
                              Document {renderDownloadStatus(file)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                    <div className="absolute -top-1 -right-1">
                      <button
                        className=" group-hover:visible invisible transition"
                        type="button"
                        aria-label="button"
                        onClick={() => {
                          handleDeleteItem(file)
                        }}
                      >
                        <IconCloseCircle className="text-gray-700 text-18" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <Input.TextArea
              autoFocus
              ref={inputRef}
              value={sendMsg}
              disabled={loading || disabled}
              onChange={(e) => {
                setSendMsg(e)
              }}
              placeholder={t('Type your message here...')}
              onKeyDown={(e) => {
                if (
                  sendMsg !== '' &&
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !uploading.current
                ) {
                  e.preventDefault()
                  handleSubmitChat()
                }
              }}
              autoSize={{maxRows: 6, minRows: 2}}
              className="no-scrollbar focus:border-[transparent] bg-[#F9F9F9] flex-shrink-0 outline-none flex-1 px-1 rounded-xl appearance-none resize-none"
            />
            <div className="flex items-center justify-between mt-3 h-8">
              {isShowModel && modelValue && modelValue.name ? (
                <ModelSelect
                  modelList={modelList}
                  className="w-[200px] bg-[#F2F2F2] rounded-[8px] border-[0.5px] border-[#AEAFB366]"
                  value={modelInfo?.id || modelValue}
                  placeholder="Select model"
                  onChange={(value) => {
                    // const info = modelList.find((v) => v.model_name === value.m)
                    if (value) {
                      changeModel(value)
                    }
                  }}
                  dropdownMenuStyle={{
                    width: 300,
                    padding: '4px 0',
                    borderRadius: '8px',
                    boxShadow: '0px 2px 10px 0px #00000026',
                  }}
                />
              ) : (
                <div />
              )}
              {isShowModel ? (
                <div className="flex items-center mr-auto">
                  <ToolSelector
                    tools={detail?.model_config?.agent_mode?.tools?.filter(
                      (v) => v.type === 'mcp_tool'
                    )}
                    handleChangeDeepSearch={handleChangeDeepSearch}
                    enabled={detail?.model_config?.agent_mode?.enabled}
                    changeTools={changeTools}
                    model={modelInfo || modelValue}
                    className="mr-auto ml-[10px] flex"
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-[2px]">
                {showUpload ? (
                  <Tooltip
                    content={t(
                      'Currently supports uploading files in txt, docx, xlsx, xls, pptx, ppt, pdf, markdown, json, html, csv formats'
                    )}
                  >
                    <UploadPngIcon
                      onChange={handleSetImg}
                      limit={
                        10 -
                        (filelistRef.current?.filter((v) => v.type === 'image')
                          ?.length || 0)
                      }
                      disabled={
                        uploading.current ||
                        !isVision ||
                        filelistRef.current.filter((v) => v.type === 'image')
                          ?.length >= 10
                      }
                      disabledMsg={
                        !isVision
                          ? t(
                              'The current model does not support visual recognition. Please switch to a visual model and then use it.'
                            )
                          : ''
                      }
                    />
                  </Tooltip>
                ) : null}
                {showUpload ? (
                  <Tooltip
                    content={t(
                      'Currently supports uploading files in txt, docx, xlsx, xls, pptx, ppt, pdf, markdown, json, html, csv formats'
                    )}
                  >
                    <UploadFileListIcon
                      onChange={handleSetFiles}
                      limit={
                        20 -
                        (filelistRef.current?.filter(
                          (v) => v.type === 'document'
                        )?.length || 0)
                      }
                      disabled={
                        uploading.current ||
                        filelistRef.current.filter((v) => v.type === 'document')
                          ?.length >= 20
                      }
                    />
                  </Tooltip>
                ) : null}
                <Tooltip content={t('Send message')}>
                  <button
                    aria-label="submit"
                    className={`flex justify-center items-center transition rounded-lg w-8 h-8 self-center ${
                      sendMsg !== '' && !loading && !uploading.current
                        ? 'bg-black text-white hover:bg-gray-900 '
                        : 'text-white bg-gray-200 '
                    }`}
                    type="submit"
                    disabled={!sendMsg || loading || uploading.current}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default React.memo(MessageInput)
