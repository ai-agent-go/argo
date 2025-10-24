import {Message, Select, Tooltip} from '@arco-design/web-react'
import {IconQuestionCircle} from '@arco-design/web-react/icon'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import ArgoModal from '~/components/Modal'
import {getCategoryList} from '~/lib/apis/models'
import MultiLinePlaceholderTextArea from '~/pages/MCPtools/ToolSettingItem/multiLinePlaceholder'

import {MODEL_TYPES} from './contants'
import ModelIcon from './icon'
import s from './index.module.less'

function ModelSetting({
  handleSubmit,
  value = undefined,
  handleClose,
  model = undefined,
  getPopupContainer = () => document.body,
}) {
  const {t} = useTranslation()
  const [currentValue, setCurrentValue] = useState([])
  const [type, setType] = useState(MODEL_TYPES[0].type)
  const [list, setList] = useState([])
  const [template, setTemplate] = useState(null)

  const getList = async () => {
    try {
      const data = await getCategoryList()
      setList(data.msg || [])
      if (value) {
        setType(value.type)
        setCurrentValue(
          value.category.length > 0
            ? value?.category?.map((v) => v.category)
            : []
        )
      }
    } catch (error) {
      Message.error(error.msg)
    }
  }

  useEffect(() => {
    getList()
    setTemplate(model?.modelfile_content)
  }, [])

  return (
    <ArgoModal
      visible
      getPopupContainer={getPopupContainer}
      handleClose={handleClose}
      title={
        <div className="items-center flex">
          <div className="text-[#03060E] font-600 text-[18px]">
            {t('Model Type')}
            <Tooltip
              style={{
                maxWidth: '560px',
                borderRadius: '3px',
                background: '#03060E',
              }}
              content={
                <div>
                  {list.map((v) =>
                    v.category?.map((i) => (
                      <div>{`${i.label}：${i.prompt}`}</div>
                    ))
                  )}
                </div>
              }
            >
              <IconQuestionCircle className="w-4 h-4 text[#565759] ml-1" />
            </Tooltip>
          </div>
        </div>
      }
      className="w-[560px]"
      footer={null}
    >
      <div className="px-5">
        <div className="text-[#565759] text-[12px] mt-2 mb-[30px]">
          {t(
            'Whether to support the corresponding ability depends entirely on the model itself. The wrong model type setting will cause the model to fail to work normally'
          )}
        </div>
        <div className="bg-[#F9F9F9] rounded-[8px] flex items-center gap-5 p-3">
          <div className="flex-1">
            <div className="text-[#565759] text-[12px] mb-[6px]">
              {t('Select model type')}
            </div>
            <Select
              bordered={false}
              className="bg-white border border-[#FFFFFF] rounded-[6px] h-9"
              onChange={(v) => {
                if (v !== type) {
                  setType(v)
                  if (v === 'embedding') {
                    setCurrentValue(['embedding'])
                  } else {
                    setCurrentValue([])
                  }
                }
              }}
              value={type}
              options={MODEL_TYPES.map((v) => ({
                value: v.type,
                label: t(v.name),
              }))}
            />
          </div>
          <div className="flex-1">
            <div className="text-[#565759] text-[12px] mb-[6px]">
              {t('Select model tag')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {list
                ?.find((v) => v.type === type)
                ?.category?.map((v) => {
                  return (
                    <div
                      className={`flex items-center h-9 cursor-pointer group hover:border-[#133EBF] hover:text-[#133EBF]  flex-1 border  ${currentValue.includes(v.category) ? 'border-[#133EBF] text-[#133EBF]' : 'border-[#EBEBEB] text-[#565759]'} bg-white rounded-[6px] justify-center gap-1 ${s.group}`}
                      key={v.category}
                      onClick={() => {
                        if (type !== 'embedding') {
                          setCurrentValue((pre) => {
                            if (pre.includes(v.category)) {
                              return pre.filter((item) => item !== v.category)
                            }
                            return [...pre, v.category]
                          })
                        }
                      }}
                    >
                      <ModelIcon url={v.icon} />
                      {/* {renderSvg(v.icon, v.category)} */}
                      {v.label}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        {type === 'chat' && model?.provider === 'ollama' ? (
          <div>
            <div className="flex justify-between mt-[22px] mb-[10px]">
              <div className="flex items-center">
                <div className="text-[#03060E] text-[14px] font-500">
                  {t('Model template&parameter')}
                </div>
                <Tooltip
                  content={t(
                    'Model template&parameter are preset structured instructions for LLM to generate responses'
                  )}
                >
                  <IconQuestionCircle className="ml-[5px] text-[#565759] text-[18px]" />
                </Tooltip>
              </div>
            </div>
            <div className="text-[#565759] text-[12px] my-2">
              {model?.modelfile_content
                ? t(
                    'There is already a model template. If the model generation effect is normal, it is highly recommended not to modify it casually'
                  )
                : t(
                    'The current model template is empty, which may cause the model to fail to chat normally'
                  )}
            </div>
            <MultiLinePlaceholderTextArea
              value={template}
              placeholder={t(`${t('Dialogue template placeholder')}
TTEMPLATE """{{ System }}
USER: {{ .Prompt }}
ASSISTANT:"""
PARAMETER stop "</s>"
PARAMETER stop "USER:"
PARAMETER stop "ASSISTANT:"`)}
              className="px-[14px] p-3 h-[140px] bg-[#F9F9F9] rounded-[8px] resize-none"
              onChange={(e) => setTemplate(e)}
            />
          </div>
        ) : null}
        <div className="flex justify-end items-center gap-2 mt-[30px]">
          <div
            onClick={handleClose}
            className="cursor-pointer rounded-[8px] px-4 text-center box-border h-[38px] leading-[38px] text-[#03060E] text-[16px] bg-[#AEAFB34D]"
          >
            {t('Cancel')}
          </div>
          <div
            onClick={async () => {
              if (!template && model?.modelfile_content && type === 'chat') {
                Message.warning({
                  content: t(
                    'The model template cannot be deleted and left empty'
                  ),
                })
                return
              }
              await handleSubmit(currentValue, type, template)
              handleClose()
            }}
            className="cursor-pointer rounded-[8px] px-4 text-center box-border h-[38px] leading-[38px] text-[#FFFFFF] text-[16px] bg-[#133EBF]"
          >
            {t('Save')}
          </div>
        </div>
      </div>
    </ArgoModal>
  )
}

export default ModelSetting
