import {Form, Input, Modal} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {validateFirstChar} from '~/utils'

import '../../../../index.css'

function CreateCustomModel({visible, onClose, onSubmit, credentials}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(credentials)
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
      className="rounded-[12px] px-[6px] w-[500px]"
      closeIcon={
        <IconClose type="close" style={{fontSize: '20px', color: '#565759'}} />
      }
      maskClosable={false}
    >
      <div className="bg-white ">
        <div className="text-[#03060E] text-[18px] font-600 mb-4">
          {t('Add Model Provider')}
        </div>
        <Form form={form} onSubmit={onSubmit} layout="vertical">
          <Form.Item
            label={t('Name')}
            field="custom_name"
            className="mb-4"
            rules={[
              {required: true, message: t('Please input your custom name')},
              {validator: validateFirstChar},
            ]}
            requiredSymbol={false}
          >
            <Input
              maxLength={15}
              placeholder={t('Enter custom name')}
              className="px-[14px] py-3 rounded-2 bg-white border-[1px] border-[#EBEBEB] rounded-[8px]"
            />
          </Form.Item>
        </Form>
        <div className="flex items-center justify-end mt-1">
          <div
            className="bg-[#AEAFB34D] w-[79px] mr-2 cursor-pointer h-[38px] rounded-[8px] box-border text-[#03060E] text-[16px] leading-[38px] text-center"
            onClick={onClose}
          >
            {t('Cancel')}
          </div>
          <div
            className="bg-[#133EBF] w-[79px] h-[38px] cursor-pointer  rounded-[8px] box-border text-white text-[16px] leading-[38px] text-center"
            onClick={() => {
              form.submit()
            }}
          >
            {t('Save')}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreateCustomModel
