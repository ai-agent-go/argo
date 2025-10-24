import {Modal} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import {forwardRef, useImperativeHandle, useState} from 'react'
import {useTranslation} from 'react-i18next'

import WechatCode from '~/layout/components/WechatCode'
import {isInArgo} from '~/utils'
import {openLogFolder, openWindow} from '~/utils/bridge'

let showFlag = false
const ErrorModal = forwardRef((_, ref) => {
  const {t} = useTranslation()
  const [showQrcode, setShowQrcode] = useState(false)
  const [visible, setVisible] = useState(false)
  // const [errorQueue, setErrorQueue] = useState([])
  // const [visibleError, setVisibleError] = useState(null)

  useImperativeHandle(ref, () => ({
    show: () => {
      if (showFlag) return
      setVisible(true)
    },
  }))
  const handleClose = () => {
    showFlag = false
    setVisible(false)
  }

  const handleShowLog = () => {
    openLogFolder()
  }

  const handleWechat = () => {
    setShowQrcode(true)
  }
  const handleGithub = () => {
    openWindow('https://github.com/xark-argo/argo')
  }
  const handleDiscord = () => {
    openWindow('https://discord.com/invite/TuMNxXxyEy')
  }

  return (
    <Modal
      visible={visible}
      title={
        <div className="w-full justify-between items-center flex">
          <div className="text-[#03060E] font-600 text-[18px]">
            {t('The service encountered an unknown exception')}
          </div>
          <div onClick={handleClose}>
            <IconClose className="w-6 h-6 text-[#565759] m-0" />
          </div>
        </div>
      }
      footer={null}
      simple
      onCancel={() => {
        handleClose()
      }}
      className="p-5 rounded-[12px]"
    >
      <div className="mt-[30px] mb-5">
        <div className="text-[#03060E] font-500 text-[14px] mb-2">
          {isInArgo()
            ? t('Open the log file to view the problem')
            : t(
                "Right-click the icon in the system tray and select 'Open the log directory' to obtain the log file"
              )}
        </div>
        {isInArgo() ? (
          <div
            onClick={handleShowLog}
            className="rounded-[8px] bg-white cursor-pointer w-max border-[1px] border-[#EBEBEB] box-border px-5 py-[9px] text-[#03060E] font-500 text-[13px]"
          >
            {t('Log directory')}
          </div>
        ) : null}
      </div>
      <div className="mb-5 text-[#565759] text-[10px] leading-[14px] ">
        {t(
          'Please report any problems encountered during use and error messages through'
        )}
        <span
          className="text-[#133EBF] relative mx-1 cursor-pointer inline-block"
          onClick={handleWechat}
        >
          {t('WeChat group')},
          <WechatCode showQrcode={showQrcode} setShowQrcode={setShowQrcode} />
        </span>
        <span
          className="text-[#133EBF] mx-1 cursor-pointer"
          onClick={handleGithub}
        >
          {t('Github')},
        </span>
        <span
          className="text-[#133EBF] mx-1 cursor-pointer"
          onClick={handleDiscord}
        >
          {t('Discord')}
        </span>
        {t(
          '. This will help us solve problems faster. Thank you for your support!'
        )}
      </div>
      <div
        className="w-[270px] h-[42px] cursor-pointer mx-auto bg-[#03060E] text-white text-center leading-[42px] rounded-[8px]"
        onClick={handleClose}
      >
        {t('Confirm')}
      </div>
    </Modal>
  )
})

export default ErrorModal
