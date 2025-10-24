import {
  Form,
  Input,
  InputNumber,
  Popover,
  Select,
  Slider,
  Tooltip,
} from '@arco-design/web-react'
import {IconQuestionCircle} from '@arco-design/web-react/icon'
import {useEffect, useRef, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'

import CategoryList from '~/components/CategoryList'
import ModelSelect from '~/components/ModelSelect'
import OverflowTooltip from '~/components/OverflowTooltip'
import ArrowIcon from '~/pages/assets/ArrowIcon'

import {PRESET_VALUE} from './constants'
import s from './index.module.less'

function BotSetting({detail, handleChangeModelConfig, modelList}) {
  const [form] = Form.useForm()
  const {t} = useTranslation()
  const selectRef = useRef(null)
  const [modelInfo, setModelInfo] = useState(undefined)

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (detail?.model_config?.model && modelList.length > 0) {
      const info = modelList.find((v) =>
        detail?.model_config?.model?.model_id
          ? v.id === detail?.model_config?.model?.model_id
          : v.model_name === detail?.model_config?.model?.name &&
            v.provider === detail?.model_config?.model?.provider
      )
      if (info) {
        setModelInfo(info)
      }
    }
  }, [detail, modelList])

  const renderPopover = (
    <div className="min-w-[430px] relative box-content">
      <Form
        form={form}
        className={s.formWrap}
        initialValues={detail?.model_config}
        onSubmit={handleChangeModelConfig}
      >
        <Form.Item noStyle hidden field="model.mode" initialValue="chat" />
        <div className="flex w-full items-center justify-between h-[70px]">
          <div className="font-700 text-[18px] mr-[80px] text-[#03060E] shrink-0">
            {t('Model')}
          </div>
          <Form.Item hidden field="model.provider">
            <Input />
          </Form.Item>
          <Form.Item hidden field="model.icon_url">
            <Input />
          </Form.Item>
          <Form.Item hidden field="model.model_id">
            <Input />
          </Form.Item>
          <Form.Item hidden field="model.name">
            <Input />
          </Form.Item>
          <Form.Item noStyle>
            <ModelSelect
              value={modelInfo || detail?.model_config?.model}
              modelList={modelList}
              className="rounded-lg w-[265px] text-sm outline-none bg-[#F2F2F2] border-[0.5px] border-[#AEAFB366] overflow-hidden"
              dropdownMenuClassName="w-[265px] py-1"
              onChange={(e) => {
                form.setFieldsValue({
                  'model.name': e.model_name,
                  'model.model_id': e.id,
                  'model.provider': e.provider,
                  'model.icon_url': e.icon_url,
                })
              }}
            />
          </Form.Item>
        </div>
        <hr className="mb-5" />
        <div className="mb-3 max-h-[300px] overflow-y-scroll">
          <div className="flex justify-between">
            <div className="font-700 text-gray-900 shrink-0 flex items-center">
              {t('Options')}
              <Tooltip
                position="tl"
                style={{
                  maxWidth: '560px',
                  height: '76px',
                  borderRadius: '3px',
                  background: '#03060E',
                }}
                className={s.Tooltip}
                // trigger="click"
                content={
                  <div className="h-full overflow-scroll px-1 py-[5px] box-border w-full no-scrollbar">
                    {t(
                      `Temperature：high → creative imagination / low → rigorous focus`
                    )}
                    <br />
                    {t(
                      `Top P：high → multiple possibilities / low → precise selection`
                    )}
                    <br />
                    {t(
                      `Context window：The maximum number of tokens available for a single interaction.`
                    )}
                    <br />
                    {t(
                      `Num Predict： high → elaborate in detail / low → be concise and to the point`
                    )}
                    <br />
                    {t(
                      `Presence Penalty：high → Avoid repetition / low → Maintain repetition`
                    )}
                    <br />
                    {t(
                      `Repeat Last N：high → pay attention to more content / low → pay attention to less content`
                    )}
                    <br />
                    {t(
                      `Frequency Penalty：high → rich expression / low → common vocabulary`
                    )}
                  </div>
                }
              >
                <IconQuestionCircle className="ml-1" />
              </Tooltip>
            </div>
            <div
              className={`border-transparent rounded-[4px] bg-[#F9F9F9] overflow-hidden ${s.selectContainer}`}
              ref={selectRef}
            >
              <Select
                value={t('Presets')}
                getPopupContainer={() => selectRef.current}
                bordered={false}
                className="border-transparent bg-transparent"
                arrowIcon={<ArrowIcon />}
                onChange={(v) => {
                  form.setFieldValue('model.completion_params', v)
                }}
                dropdownMenuClassName={s.selectWrap}
              >
                {PRESET_VALUE.map((v) => (
                  <Select.Option
                    value={v.value as any}
                    key={v.label}
                    className={s.item}
                  >
                    <img src={v.icon} alt="" className="w-4 h-4" />
                    {t(v.label)}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0 flex items-center">
              <Trans
                i18nKey="Temperature"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item field="model.completion_params.temperature" noStyle>
              <Slider
                showInput
                style={{width: 269, margin: '0 4px'}}
                max={1}
                step={0.1}
              />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0">
              <Trans
                i18nKey="Top P"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item field="model.completion_params.top_p" noStyle>
              <Slider
                showInput
                style={{width: 269, margin: '0 4px'}}
                max={1}
                step={0.01}
              />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0">
              <Trans
                i18nKey="Context window"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item field="model.completion_params.num_ctx" noStyle>
              <InputNumber className="max-w-[65px]  text-center" hideControl />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0">
              <Trans
                i18nKey="Num Predict"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item field="model.completion_params.num_predict" noStyle>
              <InputNumber
                className="max-w-[65px] text-center"
                hideControl
                min={-1}
                max={12999}
              />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0">
              <Trans
                i18nKey="Presence Penalty"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item field="model.completion_params.presence_penalty" noStyle>
              <Slider
                showInput
                style={{width: 269, margin: '0 4px'}}
                step={0.01}
                min={0}
                max={2}
              />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0">
              <Trans
                i18nKey="Repeat Last N"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item field="model.completion_params.repeat_last_n" noStyle>
              <InputNumber className="max-w-[65px] text-center" hideControl />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between my-3 gap-[2px]">
            <div className="font-500 text-gray-900 shrink-0">
              <Trans
                i18nKey="Frequency Penalty"
                components={{
                  1: (
                    <div className="bg-[#F9F9F9] inline-block rounded-[4px] px-1 py-[1px] text-[10px] ml-1 text-[#565759]" />
                  ),
                }}
              />
            </div>
            <Form.Item
              field="model.completion_params.frequency_penalty"
              noStyle
            >
              <Slider
                showInput
                style={{width: 269, margin: '0 4px'}}
                step={0.01}
                min={0}
                max={2}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item noStyle>
          <div className="flex items-center justify-end gap-6">
            <div
              onClick={() => {
                setVisible(false)
              }}
              className="flex-1 h-[42px] text-center leading-[42px] rounded-[8px] cursor-pointer border-[0.5px] border-[#EBEBEB] text-[#565759] text-[16px] bg-[##F9F9F9]"
            >
              {t('Cancel')}
            </div>
            <div
              className="flex-1 h-[42px] text-center leading-[42px] rounded-[8px] cursor-pointer text-[16px] bg-[#133EBF] text-[#FFFFFF]"
              onClick={() => {
                form.submit()
                setVisible(false)
              }}
            >
              {t('Confirm')}
            </div>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
  return (
    <Popover
      style={{maxWidth: 'unset', background: 'transparent'}}
      content={renderPopover}
      trigger="click"
      popupVisible={visible}
      onVisibleChange={setVisible}
      className={s.popover}
    >
      <div
        className={`flex w-full items-center h-12 box-border px-4 py-3 rounded-[8px] border hover:border-[1.5px] cursor-pointer ${!modelInfo ? 'border-[rgb(245,63,63)]' : ''} hover:border-[#444CE7] ${visible ? 'border-[#444CE7]' : 'border-[#EBEBEB]'}`}
      >
        <div className="font-500 flex-shrink-0 ">{t('Model Setting')}：</div>
        <div className="relative ml-2 flex-1 overflow-hidden">
          {/* <div className="block"> */}
          <div className="relative flex items-center cursor-pointer  bg-primary-50">
            <img
              alt="model-icon"
              src={modelInfo?.icon_url || detail?.model_config?.model?.icon_url}
              className=" h-4 mr-1.5 flex-shrink-0"
            />
            <div className="flex max-w-[400px] gap-1 items-center truncate text-[13px] mr-auto font-medium text-gray-800 mx-1 text-gray-900">
              <OverflowTooltip>
                {modelInfo?.model_name || detail?.model_config?.model?.name}
              </OverflowTooltip>
              <CategoryList
                list={modelInfo?.category?.category_label?.category || []}
              />
            </div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 5.77783H9"
                stroke="#133EBF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M15.75 5.77734H19.999"
                stroke="#133EBF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M4 12H10.25"
                stroke="#133EBF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M17 12H19.9998"
                stroke="#133EBF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M4 18.2222H7"
                stroke="#133EBF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M13.75 18.2222H19.9994"
                stroke="#133EBF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <ellipse
                cx="11"
                cy="5.77788"
                rx="1.75"
                ry="1.75005"
                stroke="#133EBF"
                strokeWidth="1.57504"
                strokeLinecap="round"
              />
              <ellipse
                cx="14.75"
                cy="12.0001"
                rx="1.75"
                ry="1.75005"
                stroke="#133EBF"
                strokeWidth="1.57504"
                strokeLinecap="round"
              />
              <ellipse
                cx="9.25"
                cy="18.2222"
                rx="1.75"
                ry="1.75005"
                stroke="#133EBF"
                strokeWidth="1.57504"
                strokeLinecap="round"
              />
            </svg>
            {/* </div> */}
          </div>
        </div>
      </div>
    </Popover>
  )
}

export default BotSetting
