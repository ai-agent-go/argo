import {Input, Modal} from '@arco-design/web-react'
import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

function EditMessage({
  handleSubmit,
  isCanSubmit = true,
  handleCancel,
  msg,
  submitText = 'Save',
}) {
  const {t} = useTranslation()
  const containerRef = useRef(null)
  const textAreaRef = useRef(null)
  const okRef = useRef(null)
  const cancelRef = useRef(null)
  const isClickingButton = useRef(false)
  const [value, setValue] = useState(msg)

  const onCancelEdit = () => {
    setValue(msg)
    handleCancel()
  }
  const handleClickOutside = () => {
    setTimeout(() => {
      if (isClickingButton.current) return
      Modal.confirm({
        title: t('Confirm your action'),
        content: t(
          'The current modifications have not been saved. Are you sure you want to leave?'
        ),
        okText: t('OK'),
        cancelText: t('Cancel'),
        onCancel: () => {
          setTimeout(() => {
            textAreaRef.current.focus()
          }, 100)
        },
        onOk: () => {
          onCancelEdit()
        },
      })
    })
  }

  // 全局捕获 mousedown 事件，判断是否点击了按钮
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (
        okRef.current?.contains(event.target) ||
        cancelRef.current?.contains(event.target)
      ) {
        isClickingButton.current = true // 标记为按钮点击
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div
      className="border-[2px] border-[#133EBF] rounded-[24px] bg-white box-border p-[14px]"
      ref={containerRef}
    >
      <Input.TextArea
        ref={textAreaRef}
        value={value}
        onChange={setValue}
        autoSize={{maxRows: 8, minRows: 3}}
        autoFocus
        onBlur={handleClickOutside}
        className="no-scrollbar focus:border-[transparent] bg-white flex-shrink-0 outline-none flex-1 px-1 rounded-xl appearance-none resize-none"
      />
      <div className="flex items-center justify-end gap-2">
        <div
          onClick={(e) => {
            e.stopPropagation()
            onCancelEdit()
          }}
          ref={cancelRef}
          className="border-[#EBEBEB] border-[1px] rounded-[16px] px-5 py-[6px] cursor-pointer text-[#565759] text-[14px]"
        >
          {t('Cancel')}
        </div>
        <div
          className={`bg-[#133EBF] rounded-[16px] px-5 py-[6px] text-white text-14px ${isCanSubmit ? 'cursor-pointer' : 'cursor-not-allowed bg-gary-200'}`}
          ref={okRef}
          onClick={(e) => {
            if (isCanSubmit) {
              e.stopPropagation()
              handleSubmit(value)
            }
          }}
        >
          {t(submitText)}
        </div>
      </div>
    </div>
  )
}

export default EditMessage
