import {Modal} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import React, {useRef} from 'react'
import {createRoot} from 'react-dom/client'

import './index.less'

function ArgoModal({
  getPopupContainer = () => document.body,
  visible,
  handleClose,
  title,
  footer,
  simple = true,
  className = '',
  children,
  titleClassName = '',
}) {
  return (
    <Modal
      getPopupContainer={getPopupContainer}
      visible={visible}
      title={
        <div
          className={`w-full justify-between items-center flex px-5 ${titleClassName}`}
        >
          <div className="text-[#03060E] font-600 text-[18px]">{title}</div>
          <div onClick={handleClose} className="cursor-pointer">
            <IconClose className="w-6 h-6 text-[#565759] m-0" />
          </div>
        </div>
      }
      footer={footer}
      simple={simple}
      onCancel={() => {
        handleClose()
      }}
      unmountOnExit
      className={`${className} py-5 px-0 rounded-[12px] modalWrap `}
      maskClosable={false}
    >
      {children}
    </Modal>
  )
}

function showModal(
  Component,
  {maskStyle = {}, animation = 'easeOut', maskClosable = false} = {}
) {
  const ele = document.createElement('section')
  const root = createRoot(ele)
  document.body.appendChild(ele)
  const closeMask = () => {
    root.unmount()
    document.body.removeChild(ele)
  }

  function Mask() {
    const ref = useRef(null)
    const containerRef = useRef(null)

    const handleClose = () => {
      ref.current.className = 'UI-Mask close'
      containerRef.current.className = 'maskContainer containerClose'
      setTimeout(() => {
        closeMask()
      }, 100)
    }

    return (
      <div
        ref={ref}
        className="UI-Mask"
        style={maskStyle}
        onClick={() => maskClosable && handleClose()}
      >
        <div
          ref={containerRef}
          data-ui-ani={animation}
          className="maskContainer"
          // onClick={(e) => {
          //   e.stopPropagation()
          // }}
        >
          <Component
            closeMask={handleClose}
            getPopupContainer={() => containerRef.current}
          />
        </div>
      </div>
    )
  }

  root.render(<Mask />)
}

export {showModal}
export default ArgoModal
