import {Button, Form, Message} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {updateBotConfig} from '~/lib/apis/bots'
import {mergeObjects} from '~/lib/utils'

import BotSetting from './BotSetting'
import DeepResearchItem from './DeepResearchItem'
import GreetingItem from './GreetingItem'
import KnowledgeItem from './KnowledgeItem'
import PluginsItem from './PluginsItem'
import PromptItem from './PromptItem'
import ToolsItem from './ToolsItem'
import VariableItem from './VariableItem'

function DetailForm({detail, changeDetail, modelList, handleSaveInfo}) {
  const {t} = useTranslation()
  const [form] = Form.useForm()
  const [addKnowledgeKey, setAddKnowledgeKey] = useState(0)
  const [addVariableKey, setAddVariableKey] = useState(0)
  const [addToolKey, setAddToolKey] = useState(0)
  const [selectedList, setSelectedList] = useState([])
  const [positionKey, updatePositionKey] = useState(null)

  const handleChangeKnowledge = (val) => {
    const mcpTools = detail?.model_config?.agent_mode?.tools?.filter(
      (v) => v.type === 'mcp_tool'
    )
    detail.model_config.agent_mode.tools = [...mcpTools, ...val]
    changeDetail({...detail})
  }

  const handleChangePlugins = (val) => {
    detail.model_config = val
    changeDetail({...detail})
  }

  const handleChangeTools = (val, type, value) => {
    if (type === 'deep_research' && value) {
      const newConfigs = {...detail.model_config}
      newConfigs.agent_mode.strategy = 'react_deep_research'
      newConfigs.agent_mode.enabled = true
      form.setFieldValue('model_config', newConfigs)
      detail.model_config = newConfigs
      changeDetail({...detail})
    } else if (type === 'deep_research' && !value) {
      const tools = detail?.model_config?.agent_mode?.tools?.filter(
        (v) => v.type !== 'dataset'
      )
      if (tools.length) {
        detail.model_config.agent_mode.strategy = 'tool_call'
        detail.model_config.agent_mode.enabled = true
      } else {
        detail.model_config.agent_mode.strategy = 'tool_call'
        detail.model_config.agent_mode.enabled = false
      }
      changeDetail({...detail})
    } else {
      const knowledge = detail?.model_config?.agent_mode?.tools?.filter(
        (v) => v.type === 'dataset'
      )
      detail.model_config.agent_mode.tools = [...knowledge, ...val]
      if (val.length > 0) {
        detail.model_config.agent_mode.strategy =
          detail.model_config.agent_mode.strategy === 'react_deep_research'
            ? 'react_deep_research'
            : 'tool_call'
        detail.model_config.agent_mode.enabled = true
      } else if (
        detail.model_config.agent_mode.strategy !== 'react_deep_research' ||
        !detail.model_config.agent_mode.enabled
      ) {
        // 没开启深度调研
        detail.model_config.agent_mode.enabled = false
      }
      changeDetail({...detail})
    }
    // const knowledge = detail?.model_config?.agent_mode?.tools?.filter(
    //   (v) => v.type === 'dataset'
    // )
    // detail.model_config.agent_mode.tools = [...knowledge, ...val]
    // if (val.length > 0) {
    //   detail.model_config.agent_mode.enabled = true
    // } else {
    //   detail.model_config.agent_mode.enabled = false
    // }
    // changeDetail({...detail})
  }

  const handleChangeVariable = (val) => {
    detail.model_config.user_input_form = val
    const inputs = {}
    detail?.model_config?.user_input_form?.forEach((v) => {
      const {variable, default: defaultValue}: any = Object.values(v)[0]
      inputs[variable] = defaultValue
    })
    detail.inputs = inputs
    changeDetail({...detail})
  }

  const handleSave = async () => {
    try {
      await updateBotConfig({
        model_config: detail.model_config,
        bot_id: detail.id,
      })
      handleSaveInfo(detail)
      Message.success('Save success')
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    // changeDetail({...detail})
  }

  const handleChangeModelConfig = (vals) => {
    const newConfigs = mergeObjects(detail, {model_config: {...vals}})
    form.setFieldValue('model_config', newConfigs.model_config)
    detail.model_config = newConfigs.model_config
    changeDetail({...detail})
  }

  const handleDeepResearch = (value) => {
    // const newConfigs = {...detail.model_config}
    // if (value) {
    //   newConfigs.agent_mode.strategy = 'react_deep_research'
    //   newConfigs.agent_mode.enabled = true
    //   form.setFieldValue('model_config', newConfigs)
    //   detail.model_config = newConfigs
    //   changeDetail({...detail})
    // } else {
    //   const tools = detail?.model_config?.agent_mode?.tools?.filter(
    //     (v) => v.type !== 'dataset'
    //   )
    //   handleChangeTools(tools, value)
    // }
    const tools = detail?.model_config?.agent_mode?.tools?.filter(
      (v) => v.type !== 'dataset'
    )
    handleChangeTools(tools, 'deep_research', value)
  }

  useEffect(() => {
    form.setFieldsValue(detail)
  }, [detail])

  return (
    <div className="border-r-[1px] overflow-hidden shadow-inner border-gray-200 box-border basis-[35%] relative">
      <div
        className="h-full  px-10 py-[30px] pb-[140px]  overflow-scroll "
        onScroll={() => {
          updatePositionKey(new Date())
        }}
      >
        <div className="flex items-center justify-between box-border mb-5">
          <BotSetting
            detail={detail}
            modelList={modelList}
            handleChangeModelConfig={handleChangeModelConfig}
          />
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={detail}
          className="gap-5"
        >
          <PromptItem
            value={detail?.model_config}
            onChange={(e) => {
              changeDetail({
                ...detail,
                model_config: {...e},
              })
            }}
            selectedList={selectedList}
            addTool={() => {
              setAddToolKey((pre) => pre + 1)
            }}
            addKnowledge={() => {
              setAddKnowledgeKey((pre) => pre + 1)
            }}
            addVariable={() => {
              setAddVariableKey((pre) => pre + 1)
            }}
            positionKey={positionKey}
          />
          <GreetingItem
            value={detail?.model_config}
            onChange={(e) => {
              changeDetail({
                ...detail,
                model_config: {...e},
              })
            }}
          />
          <DeepResearchItem
            modelList={modelList}
            detail={detail}
            handleDeepResearch={handleDeepResearch}
          />
          <KnowledgeItem
            selectedList={selectedList}
            setSelectedList={(value) => {
              setSelectedList(value)
            }}
            value={detail?.model_config?.agent_mode?.tools}
            onChange={handleChangeKnowledge}
            addKnowledgeKey={addKnowledgeKey}
          />
          <VariableItem
            value={detail?.model_config?.user_input_form}
            onChange={handleChangeVariable}
            addVariableKey={addVariableKey}
          />
          <ToolsItem
            value={detail?.model_config?.agent_mode?.tools}
            onChange={handleChangeTools}
            addToolKey={addToolKey}
          />
          {detail.category === 'roleplay' ? (
            <PluginsItem
              value={detail?.model_config}
              onChange={handleChangePlugins}
            />
          ) : null}
        </Form>
      </div>
      <div className="absolute px-10 bottom-0 left-0 h-[100px] w-full bg-gradient-to-b from-[#fff]/20 from-11% via-[#fff] via-20% to-[#FFF] to-11% flex items-center justify-center z-50">
        <Button
          type="primary"
          onClick={handleSave}
          className="bg-[#03060e] rounded-lg h-[40px] w-full cursor-pointer"
        >
          {t('Save')}
        </Button>
      </div>
    </div>
  )
}

export default DetailForm
