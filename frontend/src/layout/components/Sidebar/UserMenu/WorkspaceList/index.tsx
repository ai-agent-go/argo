import {useAtom} from 'jotai'
import React from 'react'
import {useHistory} from 'react-router-dom'

import {switchWorkspace} from '~/lib/apis/workspace'
import {currentWorkspace, workspaces} from '~/lib/stores'

function WorkspaceList() {
  const history = useHistory()
  const [$currentWorkspace, setCurrentWorkspace] = useAtom(currentWorkspace)
  const [$workspaces] = useAtom(workspaces)

  const handleClickWorkspace = async (workspace) => {
    await switchWorkspace({
      workspace_id: workspace.id,
    })
    setCurrentWorkspace(workspace)
    history.replace(`/bots/${workspace.id}`)
  }
  return (
    <div className="">
      {$workspaces.map((workspace) => (
        <div
          className="flex items-center py-2 h-10 cursor-pointer"
          key={workspace.id}
          onClick={() => {
            handleClickWorkspace(workspace)
          }}
        >
          <div className="shrink-0 mr-2 flex items-center justify-center w-6 h-6 bg-[#EFF4FF] rounded-md text-xs font-medium text-primary-600">
            {workspace.name[0]}
          </div>
          <div className="grow mr-2 text-sm text-gray-700 text-left">
            {workspace.name}
          </div>
          {$currentWorkspace.id === workspace.id ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 w-4 h-4 text-blue-600"
            >
              <g id="check">
                <path
                  id="Icon"
                  d="M13.3334 4L6.00008 11.3333L2.66675 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default WorkspaceList
