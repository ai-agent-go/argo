import {Button, Message, Radio} from '@arco-design/web-react'
import {IconDelete, IconEmpty} from '@arco-design/web-react/icon'
import {useAtom} from 'jotai'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import ArgoModal from '~/components/Modal'
import OverflowTooltip from '~/components/OverflowTooltip'
import {getMCPList} from '~/lib/apis/mcpTools'
import {currentWorkspace} from '~/lib/stores'
import IconTool from '~/pages/assets/ic_tool.svg'
import IconTitleTool from '~/pages/assets/tool.svg'

import ItemContainer from '../ItemContainer'

function ToolsItem({value, onChange, addToolKey}) {
  const {t} = useTranslation()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [selectedList, setSelectedList] = useState([])
  const [list, setList] = useState([])
  // const [selected, setSelected] = useState<any>(undefined)
  const [visible, setVisible] = useState(false)

  const getList = async () => {
    try {
      const data = await getMCPList()
      const enableList = (data.server_list || []).filter((item) => item.enable)
      setList(enableList || [])
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  useEffect(() => {
    if (list.length > 0 && value) {
      const acc = []
      const valueArr: any = value?.filter(({type}) => type === 'mcp_tool')

      list.forEach((cur) => {
        const idx = valueArr.findIndex((v) => v.id === cur.id)
        if (idx !== -1) {
          acc.push(cur)
        }
      })
      setSelectedList(valueArr.map((v) => ({...v, id: v.id})))
    }
  }, [value, list, visible])

  const handleSubmit = async () => {
    try {
      onChange([...selectedList])
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  useEffect(() => {
    getList()
  }, [])

  useEffect(() => {
    if (addToolKey) {
      setVisible(true)
    }
  }, [addToolKey])

  const handleRemoveItem = async (val) => {
    const idx = selectedList.findIndex((v) => v.id === val.id)
    if (idx > -1) {
      try {
        selectedList.splice(idx, 1)
        setSelectedList([...selectedList])
        onChange(
          selectedList.map((v) => ({
            id: v.id,
            name: v.name,
            description: v.description,
            enabled: true,
            type: 'mcp_tool',
          }))
        )
      } catch (err) {
        Message.error(err.msg || 'Server error, try again later')
      }
    }
  }

  const renderPopover = (
    <div className="relative box-content mt-8 px-5">
      <div className="w-full max-h-[314px] overflow-y-scroll box-border flex flex-col gap-[6px]">
        {list?.map((item) => (
          <div
            key={item.id}
            className="flex space-x-4 cursor-pointer w-full p-2  hover:bg-[#F2F6FF] rounded-xl"
            onClick={() => {
              const idx = selectedList.findIndex((v) => v.id === item.id)
              if (idx > -1) {
                selectedList.splice(idx, 1)
                setSelectedList([...selectedList])
              } else {
                setSelectedList([
                  ...selectedList,
                  {
                    id: item.id,
                    name: item.name,
                    type: 'mcp_tool',
                    description: item.description,
                    enabled: true,
                  },
                ])
              }
            }}
          >
            <div className=" flex flex-1 space-x-3.5 cursor-pointer w-full">
              <div className=" self-start w-[38px] h-[38px] pt-0.5">
                <div className="rounded-full bg-stone-700">
                  <img
                    src={IconTool}
                    alt="modelfile profile"
                    className=" rounded-full w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className={` flex-1 self-center overflow-hidden`}>
                <div className="text-[14px] font-600 w-full">
                  <OverflowTooltip>{item.name}</OverflowTooltip>
                </div>
                <div className=" text-[12px]  w-full">
                  <OverflowTooltip>{t(item.description)}</OverflowTooltip>
                </div>
              </div>
              <div className="flex flex-row gap-0.5 self-center">
                <Radio
                  checked={selectedList.findIndex((v) => v.id === item.id) > -1}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {list.length > 0 ? (
        <div className="flex items-center justify-end gap-3 mt-3">
          <Button
            className="w-[79px] h-[38px] rounded-[8px] bg-[#AEAFB34D] text-[#03060E]"
            onClick={() => {
              setVisible(false)
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="w-[79px] h-[38px] rounded-[8px] bg-[#133EBF] text-[#fff]"
            onClick={handleSubmit}
            type="primary"
          >
            {t('Confirm')}
          </Button>
        </div>
      ) : null}
      {list.length === 0 ? (
        <div className="w-full py-20 text-center">
          <IconEmpty className="text-7xl" />
          <div className="max-h-[280px] text-center p-6">
            <div>
              {t('There is no tool yet, please click to go to the ')}
              <Link
                to={`/space/${$currentWorkspace.id}/MCPtools`}
                className="font-600 text-blue-700 cursor-pointer"
                draggable="false"
              >
                {t('Tool page')}
              </Link>
              {t(' to configure.')}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  const renderIcon = () => <img src={IconTitleTool} alt="" />

  return (
    <div className="overflow-hidden">
      <ItemContainer
        title={t('Tools')}
        icon={renderIcon}
        onAdd={() => {
          setVisible(true)
        }}
      >
        {value
          .filter((v) => v.type === 'mcp_tool' && v.enabled)
          ?.map((item) => {
            return (
              <div
                key={item.id}
                className=" flex space-x-4 w-full px-3 py-2  hover:bg-black/5 rounded-xl overflow-hidden"
              >
                <div className=" flex flex-1 space-x-2 cursor-pointer overflow-hidden">
                  <div className=" self-start w-[38px] h-[38px] box-border">
                    <div className="rounded-full bg-stone-700">
                      <img
                        src={IconTool}
                        alt="modelfile profile"
                        className=" rounded-full w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  <div className={` flex-1 self-center overflow-hidden`}>
                    <div className="font-600 text-stone-700">
                      <OverflowTooltip>{item.name}</OverflowTooltip>
                    </div>
                    <div className=" text-xs ">
                      <OverflowTooltip>{item.description}</OverflowTooltip>
                    </div>
                  </div>
                  <div className="flex flex-row gap-0.5 self-center cursor-pointer ml-8">
                    <IconDelete
                      onClick={() => {
                        handleRemoveItem(item)
                      }}
                      className="text-[#565759] text-[16px]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
      </ItemContainer>
      <ArgoModal
        visible={visible}
        title={t('Choose Tools (MCP)')}
        className="w-[560px]"
        footer={null}
        handleClose={() => {
          setVisible(false)
          setSelectedList(value)
        }}
      >
        {renderPopover}
      </ArgoModal>
    </div>
  )
}

export default ToolsItem
