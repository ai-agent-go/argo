import {Form, Input, Message, Modal, Spin} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import UploadFileList from '~/components/upload/UploadFileList'
import {uploadDocument} from '~/lib/apis/documents'
import {activeChat} from '~/lib/stores'

function AddDoc({visible, setVisible, refresh, collection_name}) {
  const {t} = useTranslation()

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [$activeChat] = useAtom(activeChat)

  const handleSubmit = async (vals) => {
    setLoading(true)
    try {
      await uploadDocument({
        files: vals.document_info.map((v) => v.originFile),
        description: vals.desc || '',
        collection_name,
        bot_id: $activeChat.bot_id,
      })
      Message.success('Upload success')
      refresh()
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    } finally {
      form.clearFields()
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!visible) {
      form.clearFields()
    }
  }, [visible])

  return (
    <div>
      <Modal
        title={t('Add Document')}
        maskClosable={false}
        visible={visible}
        footer={null}
        onCancel={() => {
          setVisible(false)
        }}
        unmountOnExit
      >
        <Spin loading={loading} className="w-full">
          <Form form={form} onSubmit={handleSubmit} layout="vertical">
            <Form.Item field="document_info">
              <UploadFileList limit={1} drag />
            </Form.Item>
            <Form.Item field="desc">
              <Input placeholder={t('Why does this file interest you?')} />
            </Form.Item>
            <div className="flex items-center justify-end">
              <button
                className=" w-full rounded-2xl mr-5 font-600 text-sm py-3 transition"
                onClick={() => {
                  setVisible(false)
                }}
                type="reset"
                aria-label="cancel"
              >
                {t('Cancel')}
              </button>
              <button
                className=" bg-gray-900 hover:bg-gray-800 w-full rounded-2xl text-white font-600 text-sm py-3 transition"
                type="submit"
                aria-label="submit"
              >
                {t('Submit')}
              </button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}

export default AddDoc
