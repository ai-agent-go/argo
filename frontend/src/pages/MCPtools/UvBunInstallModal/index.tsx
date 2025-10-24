import {Modal} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import {t} from 'i18next'

export default function UvBunInstallModal({
  installVisible,
  installTool,
  setInstallVisible,
  installStatus,
  failReason,
}) {
  const buttonConfig = {
    ok: {
      style: 'bg-[#133EBF] text-[#fff] cursor-pointer',
      text: 'OK',
    },
    reinstall: {
      style: 'bg-[#133EBF] text-[#fff] cursor-pointer',
      text: 'Reinstall',
    },
    uninstalled: {
      style: 'bg-[#133EBF] text-[#fff] cursor-pointer',
      text: 'Download and Install',
    },
    installing: {
      style: 'bg-[##EBEBEB] text-[#565759] pointer-events-none',
      text: 'Installing...',
    },
    installed: {
      style: 'bg-[##EBEBEB] text-[#565759] pointer-events-none',
      text: 'Installation Complete!',
    },
  }

  return (
    <Modal
      visible={installVisible}
      footer={null}
      unmountOnExit
      className="rounded-[12px] py-[10px] px-[6px] w-[600px]"
      closeIcon={
        <IconClose type="close" style={{fontSize: '20px', color: '#565759'}} />
      }
      onCancel={() => setInstallVisible(false)}
    >
      <div>
        <div className="text-[#03060E] font-600 text-[18px] text-center">
          {t('To use the MCP tool in Argo, please install uv and bun first')}
        </div>
        <div className="text-[#565759] text-[12px] mt-2 mb-[30px] text-center">
          {t(
            'At present, only the built-in uv and bun are supported, and the installed uv and bun in the system will not be reused'
          )}
        </div>
        {failReason ? (
          <div className="text-[#EB5746] text-[12px] mb-2 text-center whitespace-pre-wrap">
            {failReason}
          </div>
        ) : null}
        <div
          className={`${buttonConfig[installStatus].style} text-[16px] w-[180px] m-auto h-[38px] leading-[38px] text-center rounded-lg`}
          onClick={installTool}
        >
          {t(buttonConfig[installStatus].text)}
        </div>
      </div>
    </Modal>
  )
}
