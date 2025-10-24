import {Form, Modal} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import RightTopArrow from '~/pages/models/images/rightTopArrow'

import ToolSettingItem from '../ToolSettingItem'

function CreateToolModal({visible, onClose, onSubmit, param}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(param)
    } else {
      form.clearFields()
    }
  }, [visible])

  if (!visible) return null
  return (
    <Modal
      visible={visible}
      footer={null}
      unmountOnExit
      onCancel={onClose}
      className="rounded-[12px] py-[10px] px-[6px] w-[520px]"
      closeIcon={
        <IconClose type="close" style={{fontSize: '20px', color: '#565759'}} />
      }
      maskClosable={false}
    >
      <div className="bg-white">
        <div className="text-[#03060E] text-[18px] font-600 mb-[30px] flex items-center">
          {t('Add MCP server')}
          <a
            href="https://docs.xark-argo.com/zh-CN/getting-started/mcp_usage"
            className="text-[#133EBF] font-500 text-[14px] ml-2"
            target="_blank"
            rel="noreferrer"
          >
            {t('Get Tutorial')}
          </a>
          <RightTopArrow />
        </div>
        <div className="max-h-[500px] overflow-auto">
          <ToolSettingItem
            onSubmit={(value) => {
              onSubmit(value)
            }}
            form={form}
          />
        </div>

        <div className="flex items-center justify-end mt-1">
          <div
            className="border-[0.5px] border-[#EBEBEB] w-[218px] mr-6 cursor-pointer h-[42px] rounded-[8px] box-border text-[#565759] text-[16px] leading-[42px] text-center"
            onClick={onClose}
          >
            {t('Cancel')}
          </div>
          <div
            className="bg-[#133EBF] w-[218px] h-[42px] cursor-pointer  rounded-[8px] box-border text-white text-[16px] leading-[42px] text-center"
            onClick={() => {
              form.submit()
            }}
          >
            {t('Submit')}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreateToolModal
