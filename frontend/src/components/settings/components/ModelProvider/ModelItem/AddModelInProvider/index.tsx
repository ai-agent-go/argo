import {Form, Input, Modal} from '@arco-design/web-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

function AddModelInProvider({visible, onClose, onSubmit}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()

  const validateFirstChar = async (value, callback) => {
    return new Promise((resolve) => {
      const regex = /^[A-Za-z0-9]/
      if (!regex.test(value[0])) {
        setTimeout(() => {
          callback(t('The first character must be a letter or number'))
          resolve('pass')
        }, 1000)
      } else {
        resolve('pass')
      }
    })
  }

  useEffect(() => {
    if (!visible) {
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
      maskClosable={false}
    >
      <div className="bg-white ">
        <div className="text-[#03060E] text-[18px] font-600 mb-4">
          {t('Custom Model Addition')}
        </div>
        <Form form={form} onSubmit={onSubmit} layout="vertical">
          <Form.Item
            label={t('Custom Model Name')}
            field="model"
            className="mb-4"
            rules={[{required: true}, {validator: validateFirstChar}]}
            requiredSymbol={false}
          >
            <Input
              placeholder={t(
                'Please enter the model ID name, for example, deepseek-ai/DeepSeek-R1'
              )}
              className="px-[14px] py-3 rounded-2 bg-white border-[1px] border-[#EBEBEB] rounded-[8px]"
            />
          </Form.Item>
        </Form>
        <div className="flex items-center justify-end">
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

export default AddModelInProvider
