import {Message, Popover, Switch} from '@arco-design/web-react'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import OverflowTooltip from '~/components/OverflowTooltip'
import {getMCPList} from '~/lib/apis/mcpTools'

import EmptyContent from './EmptyContent'
import s from './index.module.less'

function ToolPopover({children, tools, changeTools, disabled}) {
  const {t} = useTranslation()
  const [list, setList] = useState<any>([])

  const getList = async () => {
    try {
      const data = await getMCPList()
      const enableList = (data.server_list || []).filter((item) => item.enable)
      setList(enableList || [])
    } catch (error) {
      Message.error(error.msg)
    }
  }

  const selectTool = (idx, enabled) => {
    if (enabled) {
      const info = list[idx]
      const toolIdx = tools.findIndex((v) => v.id === info.id)
      if (toolIdx > -1) {
        tools[toolIdx] = {...tools[toolIdx], enabled: true}
        changeTools([...tools])
      } else {
        changeTools([
          ...tools,
          {
            id: info.id,
            name: info.name,
            description: info.description,
            type: 'mcp_tool',
            enabled: true,
          },
        ])
      }
    } else {
      const newTools = tools.map((v) => {
        if (v.id === list[idx].id) {
          return {...v, enabled: false}
        }
        return v
      })
      changeTools(newTools)
    }
  }

  const handleTotalChange = (v) => {
    if (!v) {
      changeTools(
        tools.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          type: 'mcp_tool',
          enabled: false,
        }))
      )
    } else {
      const infos = list.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: 'mcp_tool',
        enabled: true,
      }))
      changeTools(infos)
    }
  }

  useEffect(() => {
    getList()
  }, [])

  const renderPopover = (
    <div className="h-[272px] overflow-hidden flex flex-col">
      <div className="flex justify-between h-10 px-[10px] py-2 border-[#EBEBEB] border-b-[1px] ">
        <span className="text-[#03060E] font-600 text-[16px] leading-[24px]">
          {t('Tools')}
        </span>
        <Switch
          checked={tools.filter((v) => v.enabled).length > 0}
          onChange={handleTotalChange}
        />
      </div>
      <div className="flex-1 overflow-y-scroll mt-1">
        {list.map((item, idx) => {
          const info = tools.find((v) => v.id === item.id)
          let isEnabled = false
          if (info) {
            isEnabled = info.enabled
          }
          return (
            <div className="flex justify-between p-[10px]" key={item.id}>
              <div className="flex-1 flex-shrink-0 overflow-hidden">
                <div className="text-[#03060E] text-[14px] leading-[18px] w-full">
                  <OverflowTooltip>{item.name}</OverflowTooltip>
                </div>
                <div className="text-[#AEAFB3] text-[12px] leading-[16px]  w-full">
                  <OverflowTooltip>{item.description}</OverflowTooltip>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onChange={(v) => selectTool(idx, v)}
              />
            </div>
          )
        })}
        {list.length === 0 ? <EmptyContent /> : null}
      </div>
    </div>
  )

  return (
    <Popover
      content={renderPopover}
      trigger="click"
      className={s.popover}
      unmountOnExit
      disabled={disabled}
    >
      {children}
    </Popover>
  )
}

export default ToolPopover
