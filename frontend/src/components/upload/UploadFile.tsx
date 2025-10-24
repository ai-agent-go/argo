/* eslint-disable react/no-unstable-nested-components */
import {Message, Upload} from '@arco-design/web-react'
import React, {useState} from 'react'

import {uploadFile} from '~/lib/apis/upload'
import {formatSize} from '~/lib/utils'

import FileIcon from '../icons/FileIcon'

function UploadFile({
  value = {},
  onChange,
  drag = false,
}: {
  value?: any
  onChange?: any
  drag?: boolean
}) {
  const [file, setFile] = useState<any>({
    name: value?.file_name,
    url: value?.file_url,
    uid: 1,
  })
  const onChangeFile = async (_, currentFile) => {
    setFile({
      ...currentFile,
      url: URL.createObjectURL(currentFile.originFile),
    })
    const {file_url} = await uploadFile(currentFile.originFile)
    setFile({
      ...currentFile,
      url: file_url,
      status: 'done',
      percent: 100,
    })
    onChange({file_url, file_name: currentFile.originFile.name})
    Message.success('Upload Succeeded')
  }

  const renderUploadList = (fileList) => {
    const curFile = fileList[0]
    if (curFile.originFile) {
      return (
        <div className="text-14 flex items-center rounded-md w-full box-border bg-[#f7f8fa] mt-6 px-3 py-2 flex-nowrap ">
          <div className="flex-1 flex items-center truncate justify-between flex-nowrap transition-all">
            <div className="text-link-1 flex-grow flex-shrink flex truncate w-full">
              {/* <div className="w-4 h-4 flex-shrink-0">
                <FileIcon className="w-4 h-4"/>
              </div> */}
              {file.originFile.name}
            </div>
            <div className="ml-4">size: {formatSize(file.originFile.size)}</div>
          </div>
        </div>
      )
    }
    return null
  }
  return (
    <div>
      <Upload
        drag={drag}
        showUploadList={{
          progressRender: (v) => {
            if (!v.originFile) return null
            return (
              <div className="text-14 flex items-center rounded-md w-full box-border bg-[#f7f8fa] mt-6 px-3 py-2 flex-nowrap ">
                <div className="flex-1 flex items-center truncate justify-between flex-nowrap transition-all">
                  <div className="text-link-1 flex-grow flex-shrink flex truncate mr-4">
                    <FileIcon />
                    {v.originFile.name}
                  </div>
                  <div>size: {v.originFile.size / 1024}M</div>
                </div>
              </div>
            )
          },
        }}
        renderUploadList={renderUploadList}
        // showUploadList={false}
        multiple={false}
        autoUpload={false}
        onChange={onChangeFile}
        // customRequest={onChangeFile}
        fileList={file ? [file] : []}
      />
    </div>
  )
}

export default UploadFile
