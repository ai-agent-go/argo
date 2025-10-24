import {
  Button,
  Form,
  Modal,
  Slider,
  Switch,
  Tooltip,
} from '@arco-design/web-react'
import {IconQuestionCircle} from '@arco-design/web-react/icon'
import React from 'react'
import {useTranslation} from 'react-i18next'

import {mergeObjects} from '~/lib/utils'

function AgentModal({visible, onClose, detail, setDetail}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const handleSubmit = (vals) => {
    const newConfigs = mergeObjects(detail, {model_config: {...vals}})
    form.setFieldValue('model_config', newConfigs.model_config)
    detail.model_config = newConfigs.model_config
    setDetail(detail)
    onClose()
  }
  return (
    <Modal
      title={t('Bot Setting')}
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      <Form
        form={form}
        onSubmit={handleSubmit}
        initialValues={detail.model_config}
      >
        <div className="flex items-center my-3">
          <div className="font-500 text-gray-900 shrink-0 mr-36 flex items-center">
            {t('enabled')}
            <Tooltip content="Build an intelligent robot that can autonomously select tools to complete tasks.">
              <IconQuestionCircle />
            </Tooltip>
          </div>
          <Form.Item
            field="agent_mode.enabled"
            noStyle
            triggerPropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
        <div className="flex items-center justify-between my-3">
          <div className="font-500 text-gray-900 shrink-0">
            {t('Max Iteration')}
          </div>
          <Form.Item field="agent_mode.max_iteration" noStyle>
            <Slider showInput style={{width: 280}} min={0} max={5} />
          </Form.Item>
        </div>
        <Form.Item noStyle>
          <div className="flex items-center justify-end gap-3">
            <Button onClick={onClose}>{t('Cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {t('Submit')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AgentModal
