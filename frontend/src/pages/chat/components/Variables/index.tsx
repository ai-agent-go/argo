import {Form, Input, Select} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

import {activeChat} from '~/lib/stores'
// import React from 'react'
import {VARIABLE_TYPES} from '~/pages/constants'

function Variables() {
  const {t} = useTranslation()
  const [$activeChat, setActiveChat] = useAtom(activeChat)

  const {
    detail: {
      model_config: {user_input_form: formList = []} = {user_input_form: []},
    } = {},
  } = $activeChat

  const [form] = Form.useForm()

  const renderInput = (item) => {
    if (item.type === VARIABLE_TYPES.alias2Value('number')) {
      // number类型
      return (
        <Input className="bg-[#fff] rounded-[8px] h-[44px] focus:border-transparent" />
      )
    }
    if (item.type === VARIABLE_TYPES.alias2Value('dropdown')) {
      return (
        <Select
          bordered={false}
          className="bg-[#fff] rounded-[8px] overflow-hidden focus:border-transparent"
          options={item.options.map((v) => ({label: t(v), value: v}))}
          onChange={(e) => {
            form.setFieldValue(item.variable, e)
            setActiveChat({
              ...$activeChat,
              inputs: {
                ...form.getFieldsValue(),
                [item.variable]: e,
              },
            })
          }}
        />
      )
    }
    if (item.type === VARIABLE_TYPES.alias2Value('paragraph')) {
      return (
        <Input.TextArea className="bg-[#fff] rounded-[8px] min-h-[200px] focus:border-transparent" />
      )
    }
    return (
      <Input className="bg-[#fff] rounded-[8px] h-[44px]  focus:border-transparent" />
    )
  }

  useEffect(() => {
    if ($activeChat.inputs) {
      form.setFieldsValue($activeChat.inputs)
    } else {
      const inputs = {}
      formList.forEach((v) => {
        const {variable, default: defaultValue}: any = Object.values(v)[0]
        inputs[variable] = defaultValue
      })
      form.setFieldsValue(inputs)
    }
  }, [$activeChat])

  return (
    <div className="p-5 h-full bg-white overflow-scroll">
      <Form form={form} layout="vertical">
        {formList.map((item) => {
          const [type] = Object.keys(item)
          const vals = item[type]
          const label = t(vals.label)
          return (
            <Form.Item
              key={vals.variable}
              label={
                <div className="bg-[#F9F9F9] h-[48px] w-full box-border py-[14px] px-[16px] font-500 text-[#03060E] text-[14px]">
                  {label}
                </div>
              }
              field={vals.variable}
              onBlur={() => {
                const params = form.getFieldsValue()
                setActiveChat({
                  ...$activeChat,
                  inputs: params,
                })
              }}
              className="mb-4 border-[1px] rounded-[8px] border-solid border-[#EBEBEB]"
              requiredSymbol={false}
              rules={[
                {
                  required: vals.required,
                  message:
                    type === 'number'
                      ? 'Please enter number'
                      : `Please enter ${vals.label}`,
                },
              ]}
              normalize={(value) => {
                if (value && type === 'number') {
                  const val = value.replace(/[^0-9]/g, '')
                  return `${val}`
                }

                return value
              }}
            >
              {renderInput({...vals, type})}
            </Form.Item>
          )
        })}
      </Form>
    </div>
  )
}

export default Variables
