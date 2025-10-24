import {Message, Tooltip} from '@arco-design/web-react'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import {useState} from 'react'

import SidebarClose from '~/components/icons/SidebarClose'
import {addMCPTool} from '~/lib/apis/mcpTools'
import {MCPToolsList, selectMCPTool} from '~/lib/stores'
import ConfirmAction from '~/pages/models/components/ConfirmAction'
import AddImage from '~/pages/models/images/addImage'

import CreateToolModal from '../CreateToolModal'

function SidebarModelsPanel({editing, setEditing, getMCPToolList}) {
  const [showSlider, setShowSidebar] = useState(true)
  const [openCreatModal, setOpenCreatModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [clickTool, setClickTool] = useState(null)
  const [$MCPToolsList] = useAtom(MCPToolsList)
  const [$selectMCPTool, setSelectMCPTool] = useAtom(selectMCPTool)

  const handleCreate = async (value) => {
    try {
      await addMCPTool(value)
      getMCPToolList(true)
      setOpenCreatModal(false)
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const modelItem = (item) => {
    return (
      <div
        className={`py-3 px-[10px] leading-5 rounded-md hover:bg-[#EBEBEB] cursor-pointer ${$selectMCPTool.id === item.id ? 'bg-[#EBEBEB]' : ''}`}
        key={item.id}
        onClick={() => {
          if (editing) {
            setClickTool(item)
            setShowConfirm(true)
          } else {
            setSelectMCPTool(item)
          }
        }}
      >
        <div className="flex justify-between items-center">
          <Tooltip
            content={!showSlider ? `${item.name}` : ''}
            trigger="hover"
            position="rt"
          >
            <div className="text-[#03060E] ml-1 max-w-[162px] overflow-hidden text-ellipsis whitespace-nowrap ">
              {item.name}
            </div>
          </Tooltip>

          {showSlider && item.enable ? (
            <div className="text-[#133EBF] bg-[#F2F6FF] border-[0.5px] border-[rgba(19, 62, 191, 0.7)] w-[38px] h-[18px] leading-[18px] text-center rounded-[40px] text-12">
              ON
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const onOK = () => {
    setEditing(false)
    setShowConfirm(false)
    if (clickTool === 'add') {
      setOpenCreatModal(true)
    } else {
      setSelectMCPTool(clickTool)
    }
  }

  return (
    <>
      <div
        className={`bg-[#F9F9F9] flex flex-col h-[100vh] overflow-hidden ${showSlider ? 'w-[250px]' : 'w-[74px]'} transition-all duration-150`}
      >
        <div
          onClick={() => {
            localStorage.setItem('botMenuVisible', !showSlider ? '1' : '')
            setShowSidebar((pre) => !pre)
          }}
          className={`cursor-pointer w-6 h-6 my-7 ${showSlider ? 'ml-7 ' : 'mx-auto'}`}
        >
          <SidebarClose />
        </div>

        <div className={`${showSlider ? 'px-4' : 'px-[15px]'}`}>
          {showSlider ? (
            <>
              <div
                className="mb-5 text-[#03060E] h-10 leading-10 rounded-md border border-[#03060E] cursor-pointer text-center mt-[10px]"
                onClick={() => {
                  if (editing) {
                    setClickTool('add')
                    setShowConfirm(true)
                  } else {
                    setOpenCreatModal(true)
                  }
                }}
              >
                {t('Add MCP tool server')}
              </div>
              <div className="text-[16px] font-600 leading-10">
                {t('installed')}
              </div>
            </>
          ) : (
            <Tooltip
              content={t('Add MCP server')}
              trigger="hover"
              position="rt"
            >
              <div className="rounded-lg cursor-pointer">
                <div className="w-6 rounded-md overflow-hidden p-[7px] border border-[#03060E] h-6 flex items-center my-[10px] mx-auto">
                  <AddImage />
                </div>
              </div>
            </Tooltip>
          )}
          <div className="h-[calc(100vh-240px)] overflow-auto">
            {$MCPToolsList.server_list.map(modelItem)}
          </div>
        </div>
      </div>
      <CreateToolModal
        visible={openCreatModal}
        onClose={() => setOpenCreatModal(false)}
        onSubmit={handleCreate}
        param={{
          name: '',
          description: '',
          config_type: 'JSON',
          json_command: '',
          env: '',
          command: '',
          command_type: 'STDIO',
          url: '',
          headers: '',
        }}
      />
      <ConfirmAction
        onClose={() => setShowConfirm(false)}
        onOK={() => onOK()}
        visible={showConfirm}
        text={t(
          'The current modification has not been checked and will not be saved. Are you sure you want to leave?'
        )}
      />
    </>
  )
}

export default SidebarModelsPanel
