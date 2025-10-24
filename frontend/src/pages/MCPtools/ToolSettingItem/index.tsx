import {Form, Input, Radio, Tooltip} from '@arco-design/web-react'
import {IconQuestionCircle} from '@arco-design/web-react/icon'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'

import {validateFirstChar} from '~/utils'

import MultiLinePlaceholderTextArea from './multiLinePlaceholder'

export default function ToolSettingItem({
  onSubmit,
  form,
  detailPanel = false,
  setEditing = null,
}) {
  const {t} = useTranslation()

  const [configurationMethod, setConfigurationMethod] = useState('JSON')
  const [configurationType, setConfigurationType] = useState('STDIO')

  return (
    <Form
      form={form}
      onSubmit={onSubmit}
      layout="vertical"
      onValuesChange={(changeValue) => {
        // 避免第一次赋值引起setEditing变化
        if (setEditing && Object.keys(changeValue).length === 1) {
          setEditing(true)
        }
        if (changeValue.config_type) {
          setConfigurationMethod(changeValue.config_type)
        }
        if (changeValue.command_type) {
          setConfigurationType(changeValue.command_type)
        }
      }}
    >
      {!detailPanel && (
        <Form.Item
          label={t('Name')}
          field="name"
          className="mb-5"
          rules={[
            {required: true, message: t('Please enter server name')},
            {validator: validateFirstChar},
          ]}
          requiredSymbol={{position: 'end'}}
        >
          <Input
            showWordLimit
            maxLength={50}
            placeholder={t('Please enter server name')}
            className="bg-[#F9F9F9] h-11 rounded-[8px]"
          />
        </Form.Item>
      )}
      <Form.Item
        label={t('Description')}
        field="description"
        className="mb-5"
        rules={[
          {required: true, message: t('Please enter server description')},
        ]}
        requiredSymbol={{position: 'end'}}
      >
        <Input.TextArea
          showWordLimit
          maxLength={400}
          placeholder={t('Please enter server description')}
          className={`resize-none px-[14px] h-[82px] p-3 border rounded-[8px] ${detailPanel ? 'bg-[#fff] border-[#DCDCDC]' : 'bg-[#F9F9F9]'}`}
        />
      </Form.Item>
      {!detailPanel && (
        <Form.Item
          label={t('Configuration method')}
          field="config_type"
          className="mb-2"
          rules={[
            {required: true, message: t('Enter server configuration method')},
          ]}
          requiredSymbol={{position: 'end'}}
        >
          <Radio.Group defaultValue="">
            <Radio value="JSON">{t('Enter JSON')}</Radio>
            <Radio value="COMMAND">{t('Manual configuration')}</Radio>
          </Radio.Group>
        </Form.Item>
      )}
      {configurationMethod === 'JSON' && !detailPanel ? (
        <Form.Item
          field="json_command"
          className="mb-5"
          rules={[{required: true, message: t('Please enter JSON')}]}
          requiredSymbol={false}
        >
          <MultiLinePlaceholderTextArea
            value={form.getFieldValue('json_command')}
            placeholder={t(`${t('Enter JSON representation of MCP server configuration,reference format')}
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@wonderwhy-er/desktop-commander"
      ],
      "env": {},
    }
  }
}`)}
            className="px-[14px] p-3 h-[140px] bg-[#F9F9F9] rounded-[8px] resize-none"
            onChange={(value) => form.setFieldValue('json_command', value)}
          />
        </Form.Item>
      ) : (
        <>
          <Form.Item
            label={t('Type')}
            field="command_type"
            className="mb-5"
            rules={[{required: true, message: t('Enter type')}]}
            requiredSymbol={{position: 'end'}}
          >
            <Radio.Group defaultValue="STDIO">
              <Radio value="STDIO">STDIO({t('local installation')})</Radio>
              <Radio value="SSE">SSE({t('remote call')})</Radio>
            </Radio.Group>
          </Form.Item>
          {configurationType === 'STDIO' ? (
            <>
              <Form.Item
                label={t('Command')}
                field="command"
                className="mb-5"
                rules={[
                  {
                    required: true,
                    message: t('Please enter the npx or uvx command'),
                  },
                ]}
                requiredSymbol={{position: 'end'}}
              >
                <Input
                  placeholder={t(
                    `${t('Please enter the npx or uvx command')}：npx -y XXXX`
                  )}
                  className={`px-3 bg-[#F9F9F9] h-11 rounded-[8px] ${detailPanel ? 'bg-[#fff] border-[#DCDCDC]' : 'bg-[#F9F9F9]'}`}
                />
              </Form.Item>
              <Form.Item
                label={
                  <div className="flex items-center">
                    <div>{t('Environment variables')}</div>
                    <Tooltip
                      content={t(
                        'According to the environment variables required by the corresponding MCP server (such as API KEY), enter according to the format; if not needed, do not fill in'
                      )}
                    >
                      <IconQuestionCircle className="ml-[5px] text-[#565759] text-[18px]" />
                    </Tooltip>
                  </div>
                }
                field="env"
                className="mb-5"
              >
                <Input.TextArea
                  placeholder={t(
                    'Enter one environment variable per line in KEY = VALUE format'
                  )}
                  className={`resize-none px-[14px] p-3 h-[82px] rounded-[8px] ${detailPanel ? 'bg-[#fff] border-[#DCDCDC]' : 'bg-[#F9F9F9]'}`}
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label={t('URL')}
                field="url"
                className="mb-5"
                rules={[{required: true, message: t('Please enter url')}]}
                requiredSymbol={{position: 'end'}}
              >
                <Input
                  placeholder={t('Enter the remote URL')}
                  className={`px-3 h-11 rounded-[8px] ${detailPanel ? 'bg-[#fff] border-[#DCDCDC]' : 'bg-[#F9F9F9]'}`}
                />
              </Form.Item>
              <Form.Item label={t('headers')} field="headers" className="mb-5">
                <Input.TextArea
                  placeholder={`${t(
                    'Enter one in KEY:VALUE format on each line. For example,'
                  )}"Authorization": "Bearer sk-****"`}
                  className={`px-[14px] resize-none p-3 h-[104px] rounded-[8px] ${detailPanel ? 'bg-[#fff] border-[#DCDCDC]' : 'bg-[#F9F9F9]'}`}
                />
              </Form.Item>
            </>
          )}
        </>
      )}
    </Form>
  )
}
