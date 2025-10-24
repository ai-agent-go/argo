import {Modal} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

function ConfirmAction({visible, onClose, onOK, text}) {
  const {t} = useTranslation()

  return (
    <Modal
      visible={visible}
      footer={null}
      unmountOnExit
      onCancel={onClose}
      className="rounded-[12px] px-[6px] w-[500px]"
      closeIcon={false}
    >
      <div className="bg-white ">
        <div className="text-[#03060E] text-[18px] font-600 mb-2">
          {t('Confirm your action')}
        </div>
        <div className="text-[#565759] text-[12px]">{text}</div>
        <div className="flex items-center justify-end mt-5">
          <div
            className="bg-[#AEAFB34D] w-[79px] cursor-pointer text-[16px] text-[#03060E] text-center leading-[38px] mr-2 rounded-lg"
            onClick={onClose}
          >
            {t('Cancel')}
          </div>
          <div
            className="bg-[#133EBF] w-[79px] cursor-pointer text-[16px] text-[#fff] text-center leading-[38px] rounded-lg"
            onClick={() => {
              onOK()
            }}
          >
            {t('OK')}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmAction
