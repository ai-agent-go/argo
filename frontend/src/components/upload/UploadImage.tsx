import {Progress, Upload} from '@arco-design/web-react'
import {IconEdit, IconPlus} from '@arco-design/web-react/icon'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'

import {uploadFile} from '~/lib/apis/upload'

function UploadImage({
  value = '',
  onChange,
  beforeUpload = () => {
    return true
  },
}: {
  value?: string
  onChange?: any
  beforeUpload?: any
}) {
  const {t} = useTranslation()
  const [file, setFile] = useState<any>({url: value, uid: 1})
  const onChangeFile = async (_, currentFile) => {
    setFile({
      ...currentFile,
      url: URL.createObjectURL(currentFile.originFile),
    })
    const {file_url} = await uploadFile(currentFile.originFile)
    setFile({
      url: file_url,
    })
    onChange(file_url)
  }
  return (
    <div>
      <Upload
        accept="image/png, image/jpeg, image/jpg"
        showUploadList={false}
        multiple={false}
        autoUpload={false}
        onChange={onChangeFile}
        beforeUpload={beforeUpload}
        fileList={file ? [file] : []}
      >
        <div>
          {file && file.url ? (
            <div className="arco-upload-list-item-picture custom-upload-avatar">
              <img src={file.url} />
              <div className="arco-upload-list-item-picture-mask">
                <IconEdit />
              </div>
              {file.status === 'uploading' && file.percent < 100 && (
                <Progress
                  percent={file.percent}
                  type="circle"
                  size="mini"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                  }}
                />
              )}
            </div>
          ) : (
            <div className="arco-upload-trigger-picture">
              <div className="arco-upload-trigger-picture-text">
                <IconPlus />
                <div style={{marginTop: 10, fontWeight: 600}}>
                  {t('Upload')}
                </div>
              </div>
            </div>
          )}
        </div>
      </Upload>
    </div>
  )
}

export default UploadImage
