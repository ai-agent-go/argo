import {Form, Input, Message, Modal, Radio, Spin} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import UploadFileList from '~/components/upload/UploadFileList'
import {importDocsByUrl, uploadDocument} from '~/lib/apis/documents'

function AddDoc({refresh, collection_name, visible, setVisible}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const uploadDocs = async (vals) => {
    setLoading(true)
    try {
      await uploadDocument({
        files: vals.document_info.map((v) => v.originFile),
        collection_name,
      })
      Message.success('Upload success')
      refresh()
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    } finally {
      form.clearFields()
      form.setFieldsValue({
        type: 'upload',
      })
      setLoading(false)
    }
  }

  const importUrlDoc = async (vals) => {
    setLoading(true)
    try {
      await importDocsByUrl({
        ...vals,
        collection_name,
      })
      Message.success('Upload success')
      refresh()
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    } finally {
      form.clearFields()
      form.setFieldsValue({
        type: 'upload',
      })
      setLoading(false)
    }
  }

  const handleSubmit = async (vals) => {
    const {type} = vals
    if (type === 'upload') {
      uploadDocs(vals)
    } else {
      importUrlDoc(vals)
    }
  }

  useEffect(() => {
    if (!visible) {
      form.clearFields()
    } else {
      form.setFieldsValue({
        type: 'upload',
      })
    }
  }, [visible])

  return (
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
          <Form.Item
            field="type"
            label={t('Choose type')}
            initialValue="upload"
            rules={[{required: true}]}
          >
            <Radio.Group>
              <Radio value="upload">{t('upload import')}</Radio>
              <Radio value="url">{t('url import')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(pre, cur) => pre.type !== cur.type}>
            {(values) => {
              const {type} = values
              if (type === 'upload') {
                return (
                  <Form.Item
                    field="document_info"
                    label={t('Choose document')}
                    tooltip={t(
                      'Currently supports uploading files in txt, docx, xlsx, xls, pptx, ppt, pdf, markdown, json, html, csv formats'
                    )}
                    rules={[
                      {
                        required: true,
                        message: t('Please upload documents'),
                      },
                    ]}
                  >
                    <UploadFileList drag={false} />
                  </Form.Item>
                )
              }
              return (
                <Form.Item noStyle>
                  <Form.Item
                    field="url"
                    rules={[{required: true}]}
                    label={t('Document Url')}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    field="name"
                    rules={[{required: true}]}
                    label={t('Document Name')}
                  >
                    <Input />
                  </Form.Item>
                </Form.Item>
              )
            }}
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
  )
}

export default AddDoc
