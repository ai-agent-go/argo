import {Message, Tooltip, Upload} from '@arco-design/web-react'
import {useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import LinkIcon from '~/assets/link.svg'

import './index.css'

function UploadFileListIcon({
  onChange,
  disabled = false,
  limit = 20,
}: {
  onChange?: any
  disabled?: boolean
  limit?: number
}) {
  const {t} = useTranslation()
  const fileLength = useRef(0)
  const [fileList, setFileList] = useState([])

  return (
    <Tooltip
      content={t(
        'The current model supports uploading files in .docx,.txt,.pdf,.xls, .xlsx, .pptx, .ppt, .md, .json, .html, .csv  formats (up to 20 files, each with a size of 50MB).'
      )}
    >
      <div className="">
        <Upload
          showUploadList={false}
          accept=".docx,.txt,.pdf,.xls, .xlsx, .pptx, .ppt, .md, .json, .html, .csv"
          multiple
          disabled={disabled}
          limit={limit}
          onExceedLimit={() => {
            Message.warning(
              t(
                'The upload limit has been reached. You can delete some and then add more.'
              )
            )
          }}
          autoUpload={false}
          beforeUpload={(file) => {
            return new Promise((resolve, reject) => {
              if (file.size <= 50000000) {
                resolve(true)
                fileLength.current += 1
              } else {
                Message.warning(
                  t('The size exceeds the limit and cannot be uploaded.')
                )
                reject()
              }
            })
            // fileLength.current = files.length
            // return true
          }}
          fileList={fileList}
          onChange={(files) => {
            if (files.length === fileLength.current) {
              setFileList(files)
              onChange(files)
              fileLength.current = 0
              setFileList([])
            }
          }}
        >
          <img
            src={LinkIcon}
            alt=""
            className={` ${disabled ? 'cursor-not-allowed' : ''}`}
          />
        </Upload>
      </div>
    </Tooltip>
  )
}

export default UploadFileListIcon
