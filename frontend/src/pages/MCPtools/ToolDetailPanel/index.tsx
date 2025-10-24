import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Popover,
  Switch,
} from '@arco-design/web-react'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import {useEffect, useRef, useState} from 'react'

import EditIcon from '~/components/icons/EditIcon'
import GarbageBin from '~/components/icons/GarbageBin'
import SettingIcon from '~/components/icons/Settings'
import {checkMCPTool, deleteMCPList, updateMCPTool} from '~/lib/apis/mcpTools'
import {MCPToolsList, selectMCPTool} from '~/lib/stores'
import ConfirmAction from '~/pages/models/components/ConfirmAction'
import {validateFirstChar} from '~/utils'

import {useMCPToolsListActions} from '../hooks'
import ToolSettingItem from '../ToolSettingItem'
import UsefulToolItem from '../UsefulToolItem'

export default function ToolDetailPanel({setEditing}) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [serverName, setServerName] = useState(null)
  const [$MCPToolsList] = useAtom(MCPToolsList)
  const [$selectMCPTool, setSelectMCPTool] = useAtom(selectMCPTool)
  const [form] = Form.useForm()
  const [formEdit] = Form.useForm()

  const selectMCPToolRef = useRef($selectMCPTool)

  const {updateToolsList, deleteToolFromList} = useMCPToolsListActions()

  const deleteMCPTool = async () => {
    setOpenDelete(false)
    try {
      await deleteMCPList({id: $selectMCPTool.id})
      Message.success(t('Delete Success'))
      deleteToolFromList($selectMCPTool)
      setSelectMCPTool($MCPToolsList.server_list[0])
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const changeMCPTool = async (tool) => {
    try {
      await updateMCPTool(tool)
      Message.success(t('Set Success'))
      setSelectMCPTool(tool)
      updateToolsList(tool)
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const checkTool = async () => {
    setEditing(false)
    await form.validate()
    try {
      const value = form.getFieldsValue()
      const completeValue = {...$selectMCPTool, ...value}
      await updateMCPTool(completeValue)
      try {
        setSelectMCPTool({...completeValue, install_status: 'installing'})
        updateToolsList({...completeValue, install_status: 'installing'})
        const res = await checkMCPTool({id: $selectMCPTool.id})
        if (res?.server_info) {
          // 点击检查后可能切换选中的mpc，防止检查完后又跳回去($selectMCPTool的值有闭包缓存，不可以直接用)
          if (res.server_info.id === selectMCPToolRef.current.id) {
            setSelectMCPTool(res.server_info)
          }
          updateToolsList(res.server_info)
          Message.success(t('Set Success'))
        }
      } catch (err) {
        Message.error(err.msg)
        setSelectMCPTool({...$selectMCPTool, install_status: 'fail'})
        updateToolsList({...$selectMCPTool, install_status: 'fail'})
      }
    } catch (err) {
      Message.error(err.msg)
    }
  }
  const updateName = async (value) => {
    setOpenEdit(false)
    changeMCPTool({...$selectMCPTool, ...value})
  }

  useEffect(() => {
    form.setFieldsValue($selectMCPTool)
    selectMCPToolRef.current = $selectMCPTool
  }, [$selectMCPTool])

  return (
    <div>
      <div className="h-[82px] px-5 flex items-center justify-between border-b-[0.5px] border-[#EBEBEB]">
        <div className="flex items-center">
          <div className="text-[#03060E] font-600 text-[28px] mr-[10px]">
            {$selectMCPTool.name}
          </div>
          {!$selectMCPTool.preset ? (
            <Popover
              trigger="click"
              content={
                <div className="my-[-4px] mx-[-8px]">
                  <div
                    className="mb-1 w-[124px] h-9 flex items-center gap-[5px] pl-2 hover:bg-[#F9F9F9] cursor-pointer rounded-md "
                    onClick={() => {
                      formEdit.setFieldsValue({
                        name: $selectMCPTool.name,
                      })
                      setOpenEdit(true)
                    }}
                  >
                    <EditIcon /> {t('Edit')}
                  </div>
                  <div
                    className="mb-1 w-[124px] h-9 flex items-center gap-[5px] pl-2 hover:bg-[#F9F9F9] cursor-pointer rounded-md"
                    onClick={() => setOpenDelete(true)}
                  >
                    <GarbageBin strokeWidth="2" />
                    {t('Delete')}
                  </div>
                </div>
              }
            >
              <div
                className="text-ellipsis overflow-hidden text-nowrap text-[#03060e]"
                aria-describedby="tippy-10"
              >
                <SettingIcon className="w-5 h-5" />
              </div>
            </Popover>
          ) : null}
        </div>
        <div className="flex items-center">
          <Switch
            checked={$selectMCPTool.enable}
            className="w-11"
            color="#133EBF"
            onChange={async (e) => {
              if (!$selectMCPTool?.tools.length) {
                Message.warning(
                  t(
                    'Please click Check first, and it can be opened after success'
                  )
                )
                return
              }
              changeMCPTool({...$selectMCPTool, enable: e})
            }}
          />
          <div
            className={`${$selectMCPTool.install_status === 'installing' ? 'opacity-50 pointer-events-none' : ''} rounded-lg border border-[#133EBF] h-[30px] w-[76px] ml-7 text-center leading-[30px] text-[#133EBF] hover:cursor-pointer`}
            onClick={checkTool}
          >
            {t(
              $selectMCPTool.install_status === 'installing'
                ? 'Checking...'
                : 'Check'
            )}
          </div>
        </div>
      </div>

      <div className="p-5 max-h-[calc(100vh-82px)] overflow-auto">
        <ToolSettingItem
          onSubmit={null}
          form={form}
          detailPanel
          setEditing={setEditing}
        />

        {$selectMCPTool.tools?.length ? (
          <>
            <div className="text-[#03060e] font-600 mb-5">
              {t('Available Tools')}
            </div>
            <div className="bg-[#E5E6EB] rounded-[4px] flex flex-col gap-[1px] p-[1px]">
              {$selectMCPTool.tools.map((item) => (
                <UsefulToolItem key={item.name} item={item} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <Modal
        className="w-[500px] rounded-xl"
        visible={openEdit}
        closable={false}
        footer={null}
      >
        <div>
          <div className="text-[#03060E] h-6 leading-6 font-600 mb-2 text-[18px]">
            {t('Edit')}
          </div>
          <div className="text-[#565759] text-[12px]">{t('Server name')}</div>
          <Form form={formEdit} onSubmit={updateName} layout="vertical">
            <Form.Item
              field="name"
              className="mb-4"
              rules={[
                {required: true, message: t('Please enter server name')},
                {validator: validateFirstChar},
              ]}
              requiredSymbol={false}
            >
              <Input
                className="rounded-lg border border-[#EBEBEB] h-[42px] w-full mt-4 bg-[#fff]"
                type="text"
                placeholder={t('Please enter server name')}
                showWordLimit
                maxLength={50}
                value={serverName}
                onChange={(e) => setServerName(e)}
              />
            </Form.Item>
          </Form>

          <div className="mt-5 flex justify-end">
            <Button
              className="bg-[#AEAFB34D] text-[#03060E] h-[38px] w-[79px] rounded-lg text-[16px]"
              onClick={() => setOpenEdit(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              className="bg-[#133EBF] text-[#fff] h-[38px] w-[79px] rounded-lg text-[16px] ml-2"
              onClick={() => formEdit.submit()}
            >
              {t('Save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmAction
        onClose={() => setOpenDelete(false)}
        onOK={deleteMCPTool}
        visible={openDelete}
        text={t('This action cannot be undone.Do you wish to continue?')}
      />
    </div>
  )
}
