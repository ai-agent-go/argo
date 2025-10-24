import {Modal} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import React from 'react'
import {useTranslation} from 'react-i18next'

function LatestVersionInstallModal({visible, setVisible}) {
  const {t} = useTranslation()

  return (
    <Modal
      visible={visible}
      title={null}
      footer={null}
      simple
      unmountOnExit
      className={` py-5 px-0 rounded-[12px] modalWrap w-[520px] box-border`}
    >
      <div className="relative">
        <div
          onClick={() => {
            setVisible(false)
          }}
          className="cursor-pointer absolute top-0 right-5 z-10"
        >
          <IconClose className="w-6 h-6 text-[#565759] m-0" />
        </div>
        <div className="relative px-5">
          <div className="text-[#03060E] font-600 text-[18px] text-center">
            {t('The new version has started to download')}
          </div>
          <div className="text-[#565759] font-400 text-[12px] leading-[150%] mt-2 text-center">
            {t('You can view update content in Settings - About Us')}
          </div>
        </div>
        <div
          onClick={() => {
            setVisible(false)
          }}
          className="cursor-pointer w-max px-[74px] mt-[50px] mx-auto py-[7px] rounded-[8px] bg-[#133EBF] text-[#fff]"
        >
          {t('Confirm')}
        </div>
      </div>
    </Modal>
  )
}
export default React.memo(LatestVersionInstallModal)
