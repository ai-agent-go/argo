/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import {Message, Modal, Upload} from '@arco-design/web-react'
import {IconClose, IconDelete} from '@arco-design/web-react/icon'
import React, {useEffect, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'

import FileIcons from '~/components/icons/FileIcons'
import iconDownload from '~/pages/assets/ic_donwload.svg'
import {openWindow} from '~/utils/bridge'

function CreateBotByDSL({visible, onClose, handleSubmit}) {
  const {t} = useTranslation()
  const [file, setFile] = useState(undefined)

  const handleChange = async (option, newFile) => {
    setFile([newFile])
    // setFileInfo(readBlob)
  }

  useEffect(() => {
    if (!visible) {
      setFile(undefined)
      // setFileInfo('')
    }
  }, [visible])

  return (
    <Modal
      visible={visible}
      // title={t('Create by uploading files')}
      onCancel={onClose}
      footer={null}
      simple
      title={
        <div className="w-full justify-between items-center flex">
          <div className="text-[#03060E] font-600 text-[18px]">
            {t('Create by uploading files')}
          </div>
          <div onClick={onClose}>
            <IconClose className="w-6 h-6 text-[#565759] m-0" />
          </div>
        </div>
      }
      className="rounded-[12px] p-[30px] w-[520px]"
      unmountOnExit
      maskClosable={false}
    >
      <div className="mt-6">
        <div className="text-[#03060E] font-500 text-[14px] mb-2">
          {t('Configuration file upload')}
        </div>
        <Upload
          onChange={handleChange}
          multiple={false}
          className="w-full mb-5"
          accept=".zip, .png"
          showUploadList={false}
        >
          {file ? (
            <div className="flex items-center  h-14  px-[10px] py-4 rounded-xl bg-[#F2F6FF] border border-[#EBEBEB] text-[#03060E] text-[14px] font-normal group hover:bg-[#F5F8FF] hover:border-[#B2CCFF]">
              <FileIcons type={file?.[0].name?.split('.').pop()} />
              <div className="flex ml-2 w-0 grow">
                <span className="max-w-[calc(100%_-_30px)] text-ellipsis whitespace-nowrap overflow-hidden text-gray-800">
                  {file?.[0].originFile.name}
                </span>
              </div>
              <div className="hidden group-hover:flex items-center">
                <div className="btn btn-default !h-8 !px-3 !py-[6px] bg-white !text-[13px] !leading-[18px] text-gray-700">
                  {t('Change File')}
                </div>
                <div className="mx-2 w-px h-4 bg-gray-200" />
                <div
                  className="p-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setFile(undefined)
                  }}
                >
                  <IconDelete />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center h-[120px] rounded-[8px] px-8 bg-[#F2F6FF] border border-dashed border-#133EBF text-[14px] font-normal">
                <div className="w-full flex items-center justify-center gap-2">
                  <img
                    src={iconDownload}
                    alt=""
                    className="w-[22px] h-[22px]"
                  />
                  <div className="text-[#565759]">
                    {t('Drag and drop the zip/role card png file here or')}
                    <span className="pl-1 text-[#133EBF] cursor-pointer font-500">
                      {t('Select a document')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Upload>
        <div className="text-[#03060E] font-500 text-[14px] mb-2">
          {t('Configuration file acquisition guide')}
        </div>
        <div className="bg-[#F9F9F9] px-3 py-4 rounded-[8px]">
          <div className="flex items-center text-[#565759] text-[10px] leading-[14px] border-b-[0.5px] flex-wrap border-[#EBEBEB] pb-3 mb-3">
            <span>{t('Assistant & role card zip file')}：</span>
            <Trans
              i18nKey="downloadZip_1"
              components={{
                // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                1: <a href="/bots/discover" className="text-[#133EBF] mx-1" />,
              }}
            />{' '}
            <Trans
              i18nKey="downloadZip_2"
              components={{
                1: (
                  <div
                    className="text-[#133EBF] inline cursor-pointer"
                    onClick={onClose}
                  />
                ),
              }}
            />
          </div>
          <div className="flex items-center text-[#565759] text-[10px] leading-[14px]">
            <span>{t('SillyTavern png file')}：</span>
            <Trans
              i18nKey="downloadPng"
              components={{
                1: (
                  <div
                    onClick={() => {
                      openWindow('https://sillytavernai.com/')
                    }}
                    className="text-[#133EBF] font-500 mx-1"
                  />
                ),
                2: (
                  <div
                    onClick={() => {
                      openWindow('https://chub.ai/')
                    }}
                    className="text-[#133EBF] font-500 mx-1"
                  />
                ),
              }}
            />
          </div>
        </div>
        <div className="flex justify-center items-center mt-6 gap-6">
          <div
            className="flex-1 h-[42px] rounded-[8px] leading-[42px] text-center border-[0.5px] border-[#EBEBEB] bg-white text-[#565759] text-[16px] cursor-pointer"
            onClick={onClose}
          >
            {t('Cancel')}
          </div>
          <div
            className={`flex-1 h-[42px] rounded-[8px] leading-[42px] text-center border-[0.5px]  text-[16px] ${file && file.length > 0 ? 'bg-[#03060E] text-[#FFFFFF] cursor-pointer' : 'cursor-not-allowed bg-[#EBEBEB] text-[#AEAFB3]'}`}
            onClick={() => {
              if (file) {
                handleSubmit(file)
              } else {
                Message.error('Choose a File to Import')
              }
            }}
          >
            {t('Create')}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreateBotByDSL
