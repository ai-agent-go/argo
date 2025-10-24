/* eslint-disable @typescript-eslint/no-unused-vars */
import {Image} from '@arco-design/web-react'
import React from 'react'
import {useTranslation} from 'react-i18next'

import FileIcons from '~/components/icons/FileIcons'

import EditMessage from '../EditMessage'

function UserMessage({
  message,
  fileList,
  loading = false,
  isEdit = false,
  changeIsEdit = (_: boolean) => {},
  handleEditConfirm = (_: any) => {},
}) {
  const {t} = useTranslation()
  return (
    <div className="flex w-full user-message">
      <div className="prose w-full max-w-full flex flex-col justify-end  prose-headings:my-0 prose-p:my-0 prose-p:-mb-4 prose-pre:my-0 prose-table:my-0 prose-blockquote:my-0 prose-img:my-0 prose-ul:-my-4 prose-ol:-my-4 prose-li:-my-3 prose-ul:-mb-6 prose-ol:-mb-6 prose-li:-mb-4 whitespace-pre-line">
        {isEdit ? (
          <EditMessage
            msg={message}
            handleCancel={() => {
              changeIsEdit(false)
            }}
            isCanSubmit={!loading}
            submitText={t('Save and send')}
            handleSubmit={handleEditConfirm}
          />
        ) : (
          <div className="w-full">
            <div className="flex justify-end mb-2">
              <div className="rounded-[23px] rounded-tr-[4px] max-w-[75%] px-5 py-[10px] bg-[#202021E5] text-[#FFFFFF] text-[16px] leading-[26px]">
                {fileList.map((file) => {
                  const arr = file.name.split('.')
                  return (
                    <div
                      key={file.id}
                      className="h-16 my-2 w-[15rem] flex items-center space-x-3 px-2.5 rounded-xl border border-gray-200"
                    >
                      {file.type !== 'image' ? (
                        <FileIcons type={arr[arr.length - 1]} />
                      ) : (
                        <Image
                          width={42}
                          height={42}
                          src={file.url}
                          className="overflow-hidden"
                        />
                      )}

                      <div className="flex flex-col justify-center -space-y-0.5">
                        <div className="text-sm font-medium line-clamp-1">
                          {file.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {file.type !== 'image' ? t('Document') : t('Image')}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <pre>{message}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserMessage
