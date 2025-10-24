import {Message} from '@arco-design/web-react'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import React, {useEffect, useRef, useState} from 'react'
import {Prompt} from 'react-router-dom'

import {getMCPList, toolInstall, toolInstallStatus} from '~/lib/apis/mcpTools'
import {MCPToolsList, selectMCPTool} from '~/lib/stores'

import SidebarModelsPanel from './SidebarModelsPanel'
import DetailPanel from './ToolDetailPanel'
import UvBunInstallModal from './UvBunInstallModal'

function MCPtools() {
  const [editing, setEditing] = useState(false) // 记录编辑后是否检查
  const [installVisible, setInstallVisible] = useState(false)
  const [, setMCPToolsList] = useAtom(MCPToolsList)
  const [$selectMCPTool, setSelectMCPTool] = useAtom(selectMCPTool)
  const [installStatus, setInstallStatus] = useState('uninstalled')
  const [failReason, setFailReason] = useState('')
  const timer = useRef(null)

  const getMCPToolList = async (addTool = false) => {
    try {
      const res = await getMCPList()
      setMCPToolsList(res)
      if (res.server_list.length) {
        setSelectMCPTool(
          addTool
            ? res.server_list[res.server_list.length - 1]
            : res.server_list[0]
        )
      }
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const getFinalStatus = (bun, uv, node) => {
    const {errcode: bunCode, message: bunMsg} = bun
    const {errcode: uvCode, message: uvMsg} = uv
    const {errcode: nodeCode, message: nodeMsg} = node

    if (
      [
        bunMsg.toLowerCase(),
        uvMsg.toLowerCase(),
        nodeMsg.toLowerCase(),
      ].includes('installing')
    ) {
      return {errcode: -1, message: 'installing'}
    }

    // errcode有-1
    // 检查是否有uninstalled
    if (
      [
        bunMsg.toLowerCase(),
        uvMsg.toLowerCase(),
        nodeMsg.toLowerCase(),
      ].includes('uninstalled')
    ) {
      return {
        errcode: -1,
        message: 'uninstalled',
      }
    }

    // 1: 有一个errcode不为-1
    const codes = [
      {code: bunCode, msg: bunMsg},
      {code: uvCode, msg: uvMsg},
      {code: nodeCode, msg: nodeMsg},
    ].filter((entry) => entry.code !== -1)

    if (codes.length > 0) {
      const finalCode = codes[0].code
      const finalMsg = codes.map((e) => e.msg).join('\n')
      return {errcode: finalCode, message: finalMsg}
    }

    // 检查是否都是installed
    if (
      bunMsg.toLowerCase() === 'installed' &&
      uvMsg.toLowerCase() === 'installed' &&
      nodeMsg.toLowerCase() === 'installed'
    ) {
      return {errcode: -1, message: 'installed'}
    }
    // 其他情况都是installing
    return {errcode: -1, message: 'installing'}
  }

  const checkStatus = async () => {
    try {
      const pollData = await toolInstallStatus()
      const pollStatus = getFinalStatus(
        pollData.bun,
        pollData.uv,
        pollData.node
      )

      // 轮询中发现errcode不为-1 → 失败
      if (pollStatus.errcode !== -1) {
        setInstallStatus('ok')
        setFailReason(pollStatus.message)
        clearInterval(timer.current)
        return
      }

      // 轮询中发现uninstalled → 特殊处理，网络不畅
      if (pollStatus.message === 'uninstalled') {
        setInstallStatus('uninstalled')
        setFailReason(t('Installation failed: Please check the network'))
        clearInterval(timer.current)
        return
      }

      // 情况2b：轮询中发现installed → 成功
      if (pollStatus.message === 'installed') {
        setInstallStatus('installed')
        setTimeout(() => setInstallVisible(false), 2000) // 2秒后关闭
        clearInterval(timer.current)
        return
      }

      // 仍在installing状态 → 继续等待
      setInstallStatus('installing')
    } catch (err) {
      Message.error(err.msg)
      clearInterval(timer.current)
    }
  }

  const installTool = async () => {
    if (installStatus === 'ok') {
      setInstallVisible(false)
      return
    }
    setFailReason('')
    setInstallStatus('installing')

    try {
      // 第一次安装请求
      const firstTryData = await toolInstall()
      const firstStatus = getFinalStatus(firstTryData.bun, firstTryData.uv, firstTryData.node)

      // 1：第一次请求errcode不为-1 → 直接失败
      if (firstStatus.errcode !== -1) {
        setInstallStatus('ok')
        setFailReason(firstStatus.message)
        return
      }
      // 2: 第一次请求就成功了
      if (firstStatus.message === 'installed') {
        setInstallStatus('installed')
        setTimeout(() => setInstallVisible(false), 2000)
        return
      }

      // 3：第一次请求状态是installing → 开始轮询
      if (firstStatus.message === 'installing') {
        timer.current = setInterval(checkStatus, 2000)
      }
    } catch (err) {
      Message.error(err.msg)
      setInstallStatus('uninstalled')
      setFailReason(err.msg)
    }
  }

  const getStatus = async () => {
    try {
      const data = await toolInstallStatus()
      const res = getFinalStatus(data.bun, data.uv, data.node)
      if (res.message === 'uninstalled') {
        setInstallVisible(true)
        setInstallStatus('uninstalled')
      }
      if (res.message === 'installing') {
        setInstallVisible(true)
        timer.current = setInterval(checkStatus, 2000)
      }
      if (res.message === 'installed') {
        const timeout = setTimeout(() => {
          clearTimeout(timeout)
        }, 2000)
      }
      if (
        res.errcode !== -1 ||
        !['installed', 'installing', 'uninstalled'].includes(res.message)
      ) {
        setInstallVisible(true)
        setFailReason(res.message)
        setInstallStatus('ok')
      } else {
        setInstallStatus(res.message)
      }
    } catch (err) {
      Message.error(err.msg)
    }
  }

  useEffect(() => {
    getStatus()
    getMCPToolList()
  }, [])

  return (
    <div className="flex">
      <SidebarModelsPanel
        editing={editing}
        setEditing={setEditing}
        getMCPToolList={getMCPToolList}
      />
      <div className="flex-1">
        <DetailPanel setEditing={setEditing} key={$selectMCPTool.id} />
      </div>

      <UvBunInstallModal
        installTool={installTool}
        installStatus={installStatus}
        failReason={failReason}
        installVisible={installVisible}
        setInstallVisible={setInstallVisible}
      />

      <Prompt
        when={editing}
        message={t(
          'The current modifications have not been saved. Are you sure you want to leave?'
        )}
      />
    </div>
  )
}

export default MCPtools
