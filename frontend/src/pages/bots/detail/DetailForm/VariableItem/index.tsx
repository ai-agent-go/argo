import {
  Form,
  Input,
  Message,
  Modal,
  Switch,
  Tooltip,
} from '@arco-design/web-react'
import {
  IconDelete,
  IconEdit,
  IconQuestionCircle,
} from '@arco-design/web-react/icon'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import VariableIcon from '~/components/icons/VariableIcon'
import {VARIABLE_TYPES} from '~/pages/constants'

import ItemContainer from '../ItemContainer'
import VariableType from './VariableType'

function VariableItem({value, onChange, addVariableKey}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const [list, setList] = useState([])
  // const {botId, spaceId} = useParams<{botId: string; spaceId: string}>()
  const [visible, setVisible] = useState(false)
  const [modelInfo, setModelInfo] = useState(undefined)

  const handleEditItem = (v, idx) => {
    setModelInfo({
      ...v,
      idx,
    })
    const [type] = Object.keys(v)
    form.setFieldsValue({
      type,
      ...v[type],
    })
    setVisible(true)
  }

  const handleRemoveItem = async (val, idx) => {
    list.splice(idx, 1)
    setList([...list])
    onChange(list)
  }

  const handleCreate = (vals) => {
    const idx = list.findIndex((v) => {
      const [type] = Object.keys(v)
      return vals.variable === v[type].variable
    })

    if (modelInfo) {
      // edit
      list[modelInfo.idx] = {
        [vals.type]: vals,
      }
      setList([...list])
      onChange([...list])
      setModelInfo(undefined)
    } else if (!modelInfo && idx === -1) {
      const newItem = {
        [vals.type]: vals,
      }
      const newList = list.concat(newItem)
      setList(newList)
      onChange(newList)
    } else {
      Message.error(
        t('The variable name already exists.', {name: vals.variable})
      )
      return
    }
    setVisible(false)
  }

  useEffect(() => {
    if (addVariableKey) {
      setVisible(true)
    }
  }, [addVariableKey])

  useEffect(() => {
    setList(value || [])
  }, [value])

  useEffect(() => {
    if (!visible) {
      form.setFieldsValue({type: 'text-input'})
      setModelInfo(undefined)
    }
  }, [visible])

  const renderPopover = (
    <div className="relative box-content">
      <Form form={form} onSubmit={handleCreate} layout="vertical">
        <Form.Item
          label={t('Variables Types')}
          field="type"
          required
          rules={[
            {
              required: true,
              message: t('Please enter', {name: t('Variables Types')}),
            },
          ]}
          // requiredSymbol={false}
          initialValue="text-input"
        >
          <VariableType />
        </Form.Item>
        <Form.Item
          label={t('Variables Name')}
          field="variable"
          required
          rules={[
            {
              required: true,
              message: t('Please enter', {name: t('Variables Name')}),
            },
            {
              match: /^(?!\d)[A-Za-z0-9_]{1,100}$/,
              message: t(
                'The variable name can only contain letters, digits, and underscores, and cannot start with a digit.'
              ),
            },
          ]}
        >
          <Input
            className="bg-[#f9f9f9] rounded-[8px] h-[44px]"
            disabled={modelInfo}
          />
        </Form.Item>
        <Form.Item
          label={t('Label Name')}
          field="label"
          required
          rules={[
            {
              required: true,
              message: t('Please enter', {name: t('Label Name')}),
            },
          ]}
        >
          <Input className="bg-[#f9f9f9] rounded-[8px] h-[44px]" />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {(values) => {
            if (values.type === VARIABLE_TYPES.alias2Value('dropdown')) {
              return (
                <Form.List
                  field="options"
                  rules={[
                    {minLength: 1, message: t('Include at least one option.')},
                  ]}
                >
                  {(fields, {add, remove}) => {
                    return (
                      <Form.Item label={t('Options')} required>
                        <div>
                          {fields.map((item, index) => (
                            <Form.Item
                              field={item.field}
                              key={item.key}
                              rules={[
                                {
                                  required: true,
                                  message: t('Please enter', {
                                    name: `${t('Options')}[${item.key}]`,
                                  }),
                                },
                              ]}
                            >
                              <Input
                                className="bg-[#f9f9f9] rounded-[8px] h-[44px] overflow-hidden"
                                addAfter={
                                  <IconDelete
                                    onClick={() => {
                                      remove(index)
                                    }}
                                  />
                                }
                              />
                            </Form.Item>
                          ))}
                          <div
                            className="bg-[#f9f9f9] rounded-[8px] h-[44px] text-[#565759] text-[14px] leading-[44px] px-[12px] box-border"
                            onClick={() => add()}
                          >
                            + {t('Add options')}
                          </div>
                        </div>
                      </Form.Item>
                    )
                  }}
                </Form.List>
              )
            }
            if (
              values.type === VARIABLE_TYPES.alias2Value('text') ||
              values.type === VARIABLE_TYPES.alias2Value('paragraph')
            ) {
              return (
                <Form.Item label={t('Default Text')} field="default">
                  <Input.TextArea className="bg-[#f9f9f9] rounded-[8px] h-[120px]" />
                </Form.Item>
              )
            }
            return null
          }}
        </Form.Item>
        <Form.Item
          label={t('Required')}
          field="required"
          triggerPropName="checked"
          initialValue
        >
          <Switch />
        </Form.Item>
      </Form>
      <div className="flex justify-between mt-[40px]">
        <div
          onClick={() => {
            setVisible(false)
          }}
          className="flex-1 h-[42px] rounded-[8px] leading-[42px] bg-[#fff] text-center text-[16px] text-[#565759] border-[0.5px] border-[#EBEBEB]"
        >
          {t('Cancel')}
        </div>
        <div
          onClick={form.submit}
          className="flex-1 h-[42px]  rounded-[8px] leading-[42px] ml-[24px] text-center bg-[#03060E] text-[#fff] text-[16px]"
        >
          {t('Submit')}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <ItemContainer
        icon={() => VariableIcon({})}
        title={
          <div className="flex items-center">
            {t('Variable')}
            <Tooltip
              content={t(
                t(
                  'Variables will be filled in by users in the form before the conversation. The form content filled in by users will automatically replace the variables in the prompt words.'
                )
              )}
            >
              <IconQuestionCircle className="ml-1" />
            </Tooltip>
          </div>
        }
        onAdd={() => {
          setVisible(true)
        }}
      >
        {list.map((v, idx) => {
          const [, info]: any = Object.entries(v)[0]
          return (
            <div
              className={`flex flex-1 items-center space-x-3.5 w-full px-[16px] ${idx > 0 ? 'mt-4' : ''}`}
              key={info.variable}
            >
              <div className="flex-1 self-center">
                <div className="font-bold line-clamp-1 text-[#03060E] text-[12px] leading-[18px]">
                  {info.variable}
                </div>
                <div className="text-xs overflow-hidden text-ellipsis line-clamp-1 mt-[2px] text-[10px] text-[#565759]">
                  {info.label}
                </div>
              </div>
              <div className="flex flex-row gap-0.5 self-center cursor-pointer ">
                <IconEdit
                  onClick={() => {
                    handleEditItem(v, idx)
                  }}
                  className="mr-[12px] text-[#565759] text-[16px]"
                />
                <IconDelete
                  onClick={() => {
                    handleRemoveItem(v, idx)
                  }}
                  className="text-[#565759] text-[16px]"
                />
              </div>
            </div>
          )
        })}
      </ItemContainer>
      <Modal
        title={t('Creating Variables')}
        visible={visible}
        onCancel={() => {
          setVisible(false)
        }}
        footer={null}
        unmountOnExit
      >
        {renderPopover}
      </Modal>
    </div>
  )
}

export default VariableItem
