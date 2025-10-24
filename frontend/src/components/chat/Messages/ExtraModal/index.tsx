import {IconClose} from '@arco-design/web-react/icon'
import {useTranslation} from 'react-i18next'

import OverflowTooltip from '~/components/OverflowTooltip'
import {validateAndDisplayJSON} from '~/utils'
import {openLocalFolder} from '~/utils/bridge'

function ExtraModal({info, onClose, type, style = {}}) {
  const {t} = useTranslation()
  return (
    <div
      className="w-[420px] flex-shrink-0 m-5 rounded-[20px] bg-[#F9F9F9] box-border flex flex-col overflow-hidden"
      style={{...style}}
    >
      <div className="flex p-5 justify-between items-center h-[60px] border-b-[0.5px] border-[#EBEBEB]">
        <span className="text-[#03060E] font-600 text-[18px]">
          {t('Execution process')}
        </span>
        <IconClose onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-scroll">
        <div className="p-5">
          <div className="text-[#03060E] text-[18px] leading-[24px] mb-2 font-500">
            {t('Use: ')}
            {t(type)}
          </div>
          <OverflowTooltip>
            {type === 'MCP Tools' ? info.tool : info?.metadata?.knowledge_name}
          </OverflowTooltip>
        </div>
        <div className="flex flex-col overflow-hidden flex-1 px-5 pb-5">
          <div className="flex mt-5 font-500 text-[#03060E] text-[16px] mb-2">
            {t('Input: Parameters')}
          </div>
          <div className="rounded-[12px] flex-1 max-h-[323px] box-border overflow-y-scroll p-[14px]  no-scrollbar text-[#565759] text-[14px] bg-[#EBEBEB]">
            {type === 'MCP Tools' ? (
              <pre>{validateAndDisplayJSON(info.tool_input)}</pre>
            ) : (
              info.tool_input
            )}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden flex-1 px-5 pb-5">
          <div className="flex mt-5 font-500 text-[#03060E] text-[16px] mb-2">
            {t('Output: Results')}
          </div>
          <div className="rounded-[12px] flex-1 overflow-y-scroll p-[14px] no-scrollbar text-[#565759] text-[14px] bg-[#EBEBEB]">
            {type === 'MCP Tools' && !info.metadata?.error ? (
              <pre>{validateAndDisplayJSON(info.observation)}</pre>
            ) : (
              <div className="text-[#EB5746]">{info.metadata?.error}</div>
            )}
            {type === 'Knowledge' ? (
              <div>
                {info?.metadata?.retriever_resources?.map((v, idx) => (
                  <div
                    key={idx}
                    className="rounded-[10px] hover:bg-[#133EBF14] p-2 "
                  >
                    <div
                      className="font-500 text-[#03060E] text-[16px] mb-2 cursor-pointer"
                      onClick={() => {
                        openLocalFolder(v.document_path)
                      }}
                    >
                      {v.document_name}
                    </div>
                    <div className="text-[#565759] font-400 text-[14px] mb-3">
                      {v.content}
                    </div>
                    <div className="text-[#AEAFB3] text-[14px]">
                      {t('Source Knowledge Base')}:{' '}
                      {info?.metadata?.knowledge_name}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExtraModal
