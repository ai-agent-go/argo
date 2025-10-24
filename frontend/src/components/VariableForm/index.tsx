import {Form, Input, Select} from '@arco-design/web-react'
import {useEffect} from 'react'
import {useTranslation} from 'react-i18next'

// import React from 'react'
import {VARIABLE_TYPES} from '~/pages/constants'

function VariableForm({formList = [], values, onChange}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const renderInput = (item) => {
    if (item.type === VARIABLE_TYPES.alias2Value('number')) {
      // number类型
      return <Input className="bg-[#F9F9F9] rounded-[8px] h-[44px]" />
    }
    if (item.type === VARIABLE_TYPES.alias2Value('dropdown')) {
      return (
        <Select
          options={item.options.map((v) => ({label: t(v), value: v}))}
          onChange={(e) => {
            form.setFieldValue(item.variable, e)
            onChange({
              ...form.getFieldsValue(),
              [item.variable]: e,
            })
          }}
        />
      )
    }
    if (item.type === VARIABLE_TYPES.alias2Value('paragraph')) {
      return <Input.TextArea className="bg-[#F9F9F9] rounded-[8px] h-[120px]" />
    }
    return <Input className="bg-[#f9f9f9] rounded-[8px] h-[44px]" />
  }

  useEffect(() => {
    form.setFieldsValue(values)
  }, [values])

  return (
    <div className="p-5 h-full bg-white overflow-scroll">
      <Form form={form} layout="vertical">
        {formList.map((item) => {
          const [type] = Object.keys(item)
          const vals = item[type]
          return (
            <Form.Item
              key={vals.variable}
              label={t(vals.label)}
              field={vals.variable}
              onBlur={() => {
                const params = form.getFieldsValue()
                onChange(params)
              }}
              className="mb-6"
              initialValue={item.default}
              rules={[
                {
                  required: vals.required,
                  message:
                    type === 'number'
                      ? t('Please enter number')
                      : t(`Please enter`, {name: t(vals.label)}),
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

export default VariableForm
