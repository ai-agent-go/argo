import {Form, Input, Message, Tooltip} from '@arco-design/web-react'
import {IconCloseCircle} from '@arco-design/web-react/icon'
import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import FileIcons from '~/components/icons/FileIcons'
import UploadFileListIcon from '~/components/upload/UploadFileListIcon'
import {uploadDocument} from '~/lib/apis/documents'
import {getKnowledgeDetailInfo} from '~/lib/apis/knowledge'

import './index.less'

function DetailMessageInput({
  handleSubmit,
  loading,
  upLoadDisable = false,
  showUpload = false,
  disabled = false,
}: any) {
  const timer = useRef(null)
  const inputRef = useRef(null)
  const fileListRef = useRef([])
  const uploading = useRef(false)
  const {t} = useTranslation()
  const [sendMsg, setSendMsg] = useState('')
  const [fileList, setFileList] = useState([])

  const handleSubmitChat = () => {
    handleSubmit({
      message: sendMsg,
      fileList: fileListRef.current
        .filter((v) => v.document_status === 3)
        .map((v) => ({...v, id: v.partition_name, type: 'document'})),
    })
    setSendMsg('')
    setFileList([])
    fileListRef.current = []
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
    const newList = list.map((v) => {
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
    setFileList(newList)
    fileListRef.current = newList

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
    const idx = fileListRef.current.findIndex((v) => v.uid === file.uid)
    const list = fileListRef.current
    if (idx > -1) {
      list.splice(idx, 1)
      getFileListProgress(list)
      setFileList([...list])
      fileListRef.current = [...list]
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
            partition_name: success_partition_names[idx],
            document_status: 1,
            progress: 0,
          }
        }
        return file
      })
      fileListRef.current = [...fileListRef.current, ...list]
      setFileList(fileListRef.current)
      getFileListProgress(fileListRef.current)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
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
    if (!loading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [loading])

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

  return (
    <div className=" z-50 mx-auto  w-full">
      <div className="pb-[30px] inset-x-0 mx-auto">
        <Form onSubmit={handleSubmitChat}>
          <div className=" bg-[#F9F9F9] rounded-xl p-[14px]">
            {fileList.length > 0 ? (
              <div className="flex py-1 flex-wrap gap-2 max-h-[144px] overflow-scroll no-scrollbar">
                {fileList.map((file) => (
                  <div className="relative group" key={file.uid}>
                    <Tooltip
                      content={file.document_status === 2 ? file.msg : ''}
                    >
                      <div className="h-[62px] w-[314px] flex items-center gap-[10px] px-[10px] py-[13px] rounded-xl border border-[#EBEBEB] bg-white box-border">
                        <FileIcons type={file.file_type} className="w-9 h-9" />
                        <div className="flex flex-col justify-center ">
                          <div className="text-[14px] font-medium line-clamp-1 text-[#03060E] font-500">
                            {file.name}
                          </div>
                          <div className="text-[#AEAFB3] text-[10px] mt-[3px]">
                            Document {renderDownloadStatus(file)}
                          </div>
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
            <div className="flex items-center justify-end mt-3 h-8">
              <div className="flex items-center gap-[2px]">
                {showUpload ? (
                  <UploadFileListIcon
                    onChange={handleSetFiles}
                    disabled={uploading.current}
                  />
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

export default DetailMessageInput
