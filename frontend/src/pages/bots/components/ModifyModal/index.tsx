import {Button, Form, Input, Modal, Radio} from '@arco-design/web-react'
import {forwardRef, useImperativeHandle, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import UploadImage from '~/components/upload/UploadImage'
import {LOGO} from '~/lib/constants'
import {checkImageSize} from '~/utils'

const FormItem = Form.Item
const ModifyModal = forwardRef(
  ({info = {icon: LOGO}, handleSubmit}: any, ref) => {
    const loadingRef = useRef(false)
    const [visible, setVisible] = useState(false)
    const [form] = Form.useForm()
    const {t} = useTranslation()

    useImperativeHandle(ref, () => ({
      openModifyModal: () => {
        setVisible(true)
      },
    }))

    return (
      <div>
        <Modal
          visible={visible}
          onCancel={() => {
            setVisible(false)
          }}
          footer={null}
          maskClosable={false}
          unmountOnExit
        >
          <Form
            layout="horizontal"
            // className="flex flex-col justify-center"
            initialValues={{
              ...info,
              icon: info.icon || LOGO,
              category: info.category || 'assistant',
            }}
            form={form}
            labelCol={{span: 6}}
            labelAlign="right"
            wrapperCol={{span: 15}}
            onSubmit={async (val) => {
              if (loadingRef.current) return
              loadingRef.current = true
              await handleSubmit(val)
              loadingRef.current = false
              setVisible(false)
            }}
          >
            <div className="flex flex-col mt-4">
              <div className="mb-2">
                <FormItem
                  label={t('icon')}
                  field="icon"
                  className="text-sm font-600 text-left"
                  rules={[{required: true}]}
                  // requiredSymbol={false}
                >
                  <UploadImage
                    beforeUpload={async (file) => {
                      const data = await checkImageSize(
                        file,
                        {w: 160, h: 160},
                        `${t(`The image size should not be less than`)} ${160} * ${160}${t('pixels')}`
                      )
                      return data
                    }}
                  />
                </FormItem>
                <FormItem
                  label={t('Name')}
                  field="name"
                  rules={[{required: true}]}
                  className="text-sm font-600 text-left"
                  // requiredSymbol={false}
                >
                  <Input
                    type="text"
                    className=" px-5 py-3 rounded-2xl w-full text-sm outline-none border "
                    placeholder={t('Enter Your Bot Name')}
                    maxLength={30}
                  />
                </FormItem>
              </div>

              <div className="mb-2">
                <FormItem
                  label={t('Bot Type')}
                  field="category"
                  rules={[{required: true}]}
                  className="text-sm font-600 text-left"
                  // requiredSymbol={false}
                  disabled={Object.keys(info).length > 1}
                >
                  <Radio.Group name="button-radio-group">
                    {['assistant', 'roleplay'].map((item) => {
                      return (
                        <Radio
                          key={item}
                          value={item}
                          disabled={Object.keys(info).length > 1}
                        >
                          {({checked}) => {
                            return (
                              <Button
                                tabIndex={-1}
                                key={item}
                                shape="round"
                                type={checked ? 'primary' : 'default'}
                                disabled={Object.keys(info).length > 1}
                              >
                                {t(item)}
                              </Button>
                            )
                          }}
                        </Radio>
                      )
                    })}
                  </Radio.Group>
                </FormItem>
              </div>
              <div className="mb-2">
                <FormItem
                  label={t('Description')}
                  field="description"
                  rules={[{required: true}]}
                  className="text-sm font-600 text-left"
                  // requiredSymbol={false}
                >
                  <Input
                    type="text"
                    className=" px-5 py-3 mt-1 rounded-2xl w-full text-sm outline-none border "
                    placeholder={t('Enter Your bot description')}
                    maxLength={100}
                  />
                </FormItem>
              </div>
              <div className="mb-2">
                <FormItem
                  label={t('Chat background')}
                  field="background_img"
                  className="text-sm font-600 text-left"
                  extra={`${t('The image size should not be less than')} 1440 * 1024 ${t('pixels')}`}
                >
                  <UploadImage
                    beforeUpload={async (file) => {
                      const data = await checkImageSize(
                        file,
                        {
                          w: 1440,
                          h: 1024,
                        },
                        `${t(`The image size should not be less than`)} ${1440} * ${1024}${t('pixels')}`
                      )
                      return data
                    }}
                  />
                </FormItem>
              </div>
              <div className="mt-5 flex justify-end">
                <div
                  className=" w-full cursor-pointer rounded-2xl mr-5 font-600 text-sm py-3 transition text-center"
                  onClick={() => {
                    setVisible(false)
                  }}
                >
                  {t('Cancel')}
                </div>
                <div
                  className={` text-center bg-gray-900 cursor-pointer hover:bg-gray-800 w-full rounded-2xl text-white font-600 text-sm py-3 transition`}
                  onClick={() => form.submit()}
                >
                  {t('Submit')}
                </div>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }
)

export default ModifyModal
