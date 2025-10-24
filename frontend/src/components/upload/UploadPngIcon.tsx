import {Message, Tooltip, Upload} from '@arco-design/web-react'
import {useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import LinkIcon from '~/assets/uploadimg.svg'

import './index.css'

function UploadPngIcon({
  onChange,
  disabled = false,
  disabledMsg = '',
  limit = 10,
}: {
  onChange?: any
  disabled?: boolean
  disabledMsg?: string
  limit?: number
}) {
  const {t} = useTranslation()
  const fileLength = useRef(0)
  const [fileList, setFileList] = useState([])

  return (
    <Tooltip
      content={
        disabled
          ? disabledMsg
          : t(
              'The current model supports uploading images in png, jpeg, jpg, and webp formats (up to 10 pictures, each with a size of 10MB).'
            )
      }
    >
      <div className="">
        <Upload
          showUploadList={false}
          accept=".png, .jpg, .jpeg, .webp"
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
              if (file.size <= 10000000) {
                resolve(true)
                fileLength.current += 1
              } else {
                Message.warning(
                  t('The size exceeds the limit and cannot be uploaded.')
                )
                reject()
              }
            })
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

export default UploadPngIcon
