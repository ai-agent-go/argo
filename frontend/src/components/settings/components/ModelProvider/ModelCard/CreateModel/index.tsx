import {Form, Input, Modal} from '@arco-design/web-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

function CreateModel({
  visible,
  onClose,
  onSubmit,
  linkUrl,
  linkMsg,
  credentials,
}) {
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
    >
      <div className=" bg-white">
        <div className="text-[#03060E] text-[18px] font-600 mb-4">
          {t('Creating the Model')}
        </div>
        <Form form={form} onSubmit={onSubmit} layout="vertical">
          <Form.Item
            label={t('API Key')}
            field="api_key"
            className="mb-4"
            rules={[{required: true}]}
            requiredSymbol={false}
          >
            <Input className="px-[14px] py-3 rounded-2 bg-white border-[1px] border-[#EBEBEB] rounded-[8px]" />
          </Form.Item>
          <Form.Item
            label={t('API URL')}
            field="base_url"
            rules={[{required: true}]}
            requiredSymbol={false}
          >
            <Input className="px-[14px] py-3 rounded-2 bg-white border-[1px] border-[#EBEBEB] rounded-[8px]" />
          </Form.Item>
        </Form>
        <a
          target="_blank"
          href={linkUrl}
          className="text-[12px] text-[#133EBF] leading-4"
          rel="noreferrer"
        >
          {linkMsg}
        </a>
        <div className="flex items-center justify-end mt-5">
          <div
            className="bg-[rgba(174, 175, 179, 0.3)] cursor-pointer mr-2 h-[38px] rounded-[8px] px-4 py-[5px] box-border text-[#03060E] text-[16px] leading-[28px] text-center"
            onClick={onClose}
          >
            {t('Cancel')}
          </div>
          <div
            className="bg-[#133EBF] w-[79px]  cursor-pointer h-[38px] rounded-[8px] px-4 py-[5px] box-border text-white text-[16px] leading-[28px] text-center"
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
export default CreateModel
