/* eslint-disable react/no-unstable-nested-components */
import {Tooltip, Upload} from '@arco-design/web-react'
import React, {useState} from 'react'

import {formatSize} from '~/lib/utils'

import './index.css'

function UploadFileList({
  value = [],
  onChange,
  limit = undefined,
  drag = false,
}: {
  value?: any
  onChange?: any
  drag?: boolean
  limit?: number
}) {
  const [fileList, setFileList] = useState<any>(value)
  return (
    <div>
      <Upload
        drag={drag}
        limit={limit}
        accept=".docx,.txt,.pdf,.xls, .xlsx, .pptx, .ppt, .md, .json, .html, .csv"
        showUploadList={{
          fileName: (file) => {
            if (!file.originFile) return null
            return (
              <Tooltip content={file.originFile.name}>
                <div className="text-link-1 max-w-[288px] flex-shrink truncate mr-4">
                  {file.originFile.name}
                </div>
              </Tooltip>
            )
          },
          progressRender: (file) => {
            if (!file.originFile) return null
            return (
              <div className="flex-1 flex items-center truncate flex-nowrap transition-all text-12">
                size: {formatSize(file.originFile.size)}
              </div>
            )
          },
        }}
        multiple
        autoUpload={false}
        onChange={(files) => {
          setFileList(files)
          onChange(files)
        }}
        fileList={fileList}
      />
    </div>
  )
}

export default UploadFileList
