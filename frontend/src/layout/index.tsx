import {useAtom} from 'jotai'
import mermaid from 'mermaid'
import React, {useEffect, useRef} from 'react'
import {useHistory} from 'react-router-dom'

import ErrorModal from '~/components/NormalErrorModal'
import {getWorkspaceList} from '~/lib/apis/workspace'
import {currentWorkspace, workspaces} from '~/lib/stores'
import {autoLogin, isInArgo} from '~/utils'
import {errorModal} from '~/utils/errorModal'

import Content from './components/Content'
import Sidebar from './components/Sidebar'
import Updater from './Updater'

function Layout() {
  const history = useHistory()
  const modalRef = useRef(null)
  const [, setWorkspaceList] = useAtom(workspaces)
  const [$currentWorkspace, setCurrentWorkspace] = useAtom(currentWorkspace)

  const getWorkspaces = async () => {
    try {
      const data = await getWorkspaceList()
      setWorkspaceList(data.workspaces || [])
      // if (data.workspaces.length === 0 && !inArgo) {
      //   Message.error('Please log in first')
      //   history.replace('/auth')
      // } else
      if (data.workspaces.length === 0) {
        await autoLogin()
        getWorkspaces()
        return
      }
      const curWorkspace =
        data.workspaces.find((v) => v.current) || data.workspaces[0]
      if (curWorkspace) {
        setCurrentWorkspace(curWorkspace)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // const getI18n = async () => {
  //   console.log(localStorage.locale, $i18n.language)
  //   // $i18n.changeLanguage(localStorage.locale || 'en-US')
  // }

  const checkInfo = async () => {
    if (!localStorage.token) {
      await autoLogin()
    }
    getWorkspaces()
  }
  const handleGetProtocol = ({page, data}) => {
    if (page === 'bots') {
      history.push({
        pathname: `/bots/${$currentWorkspace.id}`,
        state: {data: JSON.parse(data)},
      })
    }
  }

  useEffect(() => {
    errorModal.bindRef(modalRef.current)
    checkInfo()
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
    })
    if (isInArgo()) {
      window.argoBridge.getProtocolData(handleGetProtocol)
    }
  }, [])

  if (!localStorage.token) return null

  return (
    <div className="text-gray-700 bg-[#EDEFF2]/90 h-screen max-h-[100dvh] overflow-auto flex flex-row">
      <Updater />
      <Sidebar />
      <Content currentSpaceId={$currentWorkspace.id} />
      <ErrorModal ref={modalRef} />
    </div>
  )
}

export default React.memo(Layout)
