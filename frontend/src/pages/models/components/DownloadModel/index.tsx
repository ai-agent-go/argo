import {
  Input,
  Message,
  Modal,
  Radio,
  Spin,
  Tooltip,
} from '@arco-design/web-react'
import {IconClose, IconQuestionCircle} from '@arco-design/web-react/icon'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import FileIcon from '~/components/icons/FileIcon'

function DownloadModel({visible, onClose, modelInfos, handleDownload}) {
  const {t} = useTranslation()
  const [name, setName] = useState('')
  const [modelFile, setModelFile] = useState(modelInfos?.model_template || '')
  const [selected, setSelected] = useState<any>(undefined)
  const quantization_level = [
    '8bit quantization (recommended)',
    'non-quantitative',
  ]

  const handleDownloadItem = async () => {
    if (modelInfos?.gguf_file_list?.length > 0 && !selected) {
      Message.error(t('Please choose on a gguf file'))
      return
    }
    try {
      if (modelInfos?.gguf_file_list?.length > 0) {
        await handleDownload({
          model_name: name,
          modelFile,
          gguf_file: selected.name,
          use_xunlei: false,
          category: modelInfos.category,
          parameter: modelInfos.parameter,
        })
      } else {
        await handleDownload({
          model_name: name,
          modelFile,
          quantization_level: selected === 'non-quantitative' ? 'f32' : 'q8_0',
          use_xunlei: false,
          category: modelInfos.category,
          parameter: modelInfos.parameter,
        })
      }
    } catch (err) {
      Message.warning(err.msg)
    }
  }

  useEffect(() => {
    if (
      !modelInfos?.gguf_file_list ||
      modelInfos?.gguf_file_list.length === 0
    ) {
      setSelected(quantization_level[0])
    } else {
      setSelected(null)
    }
    if (modelInfos?.repo_id) {
      setName(modelInfos?.repo_id)
    }
    if (modelInfos?.model_template) {
      setModelFile(modelInfos?.model_template)
    }
  }, [modelInfos])

  const renderList = () => {
    if (modelInfos?.gguf_file_list?.length > 0) {
      return (
        <div>
          <div className="mb-2 mt-5 text-md font-600">
            {t('Choose on a gguf file')}
          </div>
          {modelInfos?.gguf_file_list?.map((model) => (
            <div
              key={model.name}
              className={`flex space-x-4 cursor-pointer w-full px-3 py-2 hover:bg-black/5 rounded-xl ${selected?.name === model.name ? 'bg-black/5' : ''}`}
              onClick={() => {
                setSelected(model)
              }}
            >
              <div className=" flex flex-1 space-x-3.5 cursor-pointer w-full">
                <div className=" self-start w-8 pt-0.5">
                  <div className="rounded-full">
                    <FileIcon className="w-full h-auto" />
                  </div>
                </div>

                <div className={` flex-1 self-center`}>
                  <div className="  font-bold line-clamp-1">{model.name}</div>
                  <div className=" text-xs overflow-hidden text-ellipsis line-clamp-1">
                    size: {model.size}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-0.5 self-center">
                <Radio checked={selected?.name === model.name} />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div>
        <div className="mb-2 mt-5 flex gap-1 items-center">
          <div className="text-md text-[#03060E] font-500 text-[14px]">
            {t('Quantization level')}
          </div>
          <Tooltip
            content={
              <div className="whitespace-pre-line">
                {t(
                  '8bit quantization : The model occupies less storage space and has a fast inference speed, but there will be a slight loss in accuracy.origin: Keep the original size of the model'
                )}
              </div>
            }
          >
            <IconQuestionCircle className="ml-[5px] text-[#565759] text-[18px]" />
          </Tooltip>
        </div>

        <Radio.Group
          value={selected}
          onChange={(e) => {
            setSelected(e)
          }}
        >
          {quantization_level.map((item) => (
            <Radio key={item} value={item}>
              {t(item)}
            </Radio>
          ))}
        </Radio.Group>
        <div className="mb-2 mt-5 text-md text-[#03060E] font-500 text-[14px]">
          {t('File list')}
        </div>
        {modelInfos?.repo_file_list?.map((model) => (
          <div
            key={model.name}
            className=" flex space-x-4 cursor-pointer w-full px-3 py-2 hover:bg-black/5 rounded-xl"
          >
            <div className=" flex flex-1 space-x-3.5 cursor-pointer w-full">
              <div className=" self-start w-8 pt-0.5">
                <div className="rounded-full">
                  <FileIcon className="w-full h-auto" />
                </div>
              </div>

              <div className={` flex-1 self-center`}>
                <div className="  font-bold line-clamp-1">{model.name}</div>
                <div className=" text-xs overflow-hidden text-ellipsis line-clamp-1">
                  size: {model.size}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!visible) {
    return null
  }

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      onConfirm={() => {
        handleDownloadItem()
      }}
      unmountOnExit
      footer={null}
      className="rounded-xl py-[6px]"
      closeIcon={
        <IconClose type="close" style={{fontSize: '20px', color: '#565759'}} />
      }
      maskClosable={false}
    >
      <div className="text-[#03060E] text-[18px] font-600 mb-[30px]">
        {t('Model file download')}
      </div>
      <Spin loading={!modelInfos.repo_id} className="w-full">
        <div className="w-full">
          <div className=" text-sm font-medium text-left mb-2 text-[#03060E] font-500 text-[14px]">
            {t('Name')}
          </div>
          <Input
            value={name}
            onChange={(e) => {
              setName(e)
            }}
            type="text"
            className=" px-5 py-3 rounded-2xl w-full text-sm outline-none border"
            placeholder={t('Name your model')}
            required
            disabled
          />
        </div>
        <div className=" my-2 mb-5 max-h-40 overflow-y-scroll">
          {renderList()}
        </div>
        <div className="flex items-center justify-end mt-1">
          <div
            className="border-[0.5px] border-[#EBEBEB] w-[218px] mr-6 cursor-pointer h-[42px] rounded-[8px] box-border text-[#565759] text-[16px] leading-[42px] text-center"
            onClick={onClose}
          >
            {t('Cancel')}
          </div>
          <div
            className={`bg-[#133EBF] w-[218px] h-[42px] cursor-pointer  rounded-[8px] box-border text-white text-[16px] leading-[42px] text-center ${modelInfos?.gguf_file_list?.length && !selected ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={() => {
              handleDownloadItem()
            }}
          >
            {t('Submit')}
          </div>
        </div>
      </Spin>
    </Modal>
  )
}

export default DownloadModel
