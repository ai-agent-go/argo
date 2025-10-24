import {Button, Message, Modal} from '@arco-design/web-react'
import {asBlob} from 'html-docx-js-typescript'
import {useAtom} from 'jotai'
import React, {useState} from 'react'
import ReactQuill from 'react-quill'

import {uploadDocument} from '~/lib/apis/documents'
import {activeChat} from '~/lib/stores'

import 'react-quill/dist/quill.snow.css'

function AddText({visible, onClose, collection_name, refresh}) {
  const [editorHtml, setEditorHtml] = useState('')
  const [$activeChat] = useAtom(activeChat)
  const [loading, setLoading] = useState(false)

  // const [loading, setLoading] = useState(false)

  const handleSubmit = async (blob) => {
    setLoading(true)
    try {
      await uploadDocument({
        files: [blob],
        collection_name,
        bot_id: $activeChat.bot_id,
      })
      Message.success('Upload success')
      refresh()
      onClose()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    } finally {
      setLoading(false)
    }
  }

  const modules = {
    toolbar: [
      [{header: '1'}, {header: '2'}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{list: 'ordered'}, {list: 'bullet'}, {indent: '-1'}, {indent: '+1'}],
      ['link', 'image'],
      ['clean'],
    ],
  }

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ]

  const handleExport = async () => {
    // 将编辑后的内容转换为HTML文档
    const doc = `<!DOCTYPE html><html><head><title>Generated Document</title></head><body>${editorHtml}</body></html>`
    const blob = await asBlob(doc)
    handleSubmit(blob)
    // // 创建一个Blob对象并下载
    // const blob = new Blob([doc], {type: 'text/html'})
    // const url = URL.createObjectURL(blob)
    // const a = document.createElement('a')
    // a.href = url
    // a.download = 'generated_document.html'
    // a.click()
    // URL.revokeObjectURL(url)
  }

  return (
    <Modal visible={visible} onCancel={onClose} footer={null}>
      <div className="h-[300px] mt-3">
        <ReactQuill
          theme="snow"
          value={editorHtml}
          onChange={setEditorHtml}
          modules={modules}
          formats={formats}
          className="h-[220px]"
        />
      </div>
      <Button
        type="primary"
        className="text-right mt-6 "
        onClick={handleExport}
        loading={loading}
      >
        Save
      </Button>
    </Modal>
  )
}

export default AddText
