import {Message, Tooltip} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import GarbageBin from '~/components/icons/GarbageBin'
import MemberAddIcon from '~/components/icons/MemberAddIcon'
import {
  deleteWorkspaceMembers,
  getWorkspaceMembers,
  updateWorkspaceMembers,
} from '~/lib/apis/workspace'
import {LOGO} from '~/lib/constants'
import {currentWorkspace} from '~/lib/stores'

import AddMemberModal from '../AddMemberModal'

function Members() {
  const {t} = useTranslation()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [list, setList] = useState([])
  const [visible, setVisible] = useState(false)

  const getList = async () => {
    try {
      const data = await getWorkspaceMembers($currentWorkspace.id)
      setList(data.members || [])
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const handleRemove = async (member) => {
    try {
      await deleteWorkspaceMembers($currentWorkspace.id, {user_id: member.id})
      Message.success(t('Delete Success'))
      getList()
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const handleAdd = async (val) => {
    try {
      await updateWorkspaceMembers($currentWorkspace.id, {...val})
      Message.success(t('Add Success'))
      getList()
      setVisible(false)
    } catch (err) {
      Message.error(err.msg)
    }
  }

  useEffect(() => {
    getList()
  }, [])

  return (
    <div>
      <div className="relative">
        <div className="px-4 sm:px-8 pt-2">
          <div className="flex flex-col">
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-2xl">
              <img
                src={LOGO}
                className="block w-auto h-6 rounded-2xl"
                alt="logo"
              />
              <div className="grow mx-2">
                <div className="text-sm font-600 text-gray-900">
                  {$currentWorkspace.name}
                </div>
              </div>
              <div
                onClick={() => {
                  setVisible(true)
                }}
                className="shrink-0 flex items-center py-[7px] px-3 border-[0.5px] border-gray-200 text-[13px] font-600 text-primary-600 bg-white shadow-xs rounded-lg cursor-pointer"
              >
                <MemberAddIcon />
                {t('Add')}
              </div>
            </div>
            <div className="overflow-visible lg:overflow-visible">
              <div className="flex items-center py-[7px] border-b border-gray-200 min-w-[480px]">
                <div className="grow px-3 text-xs font-600 text-gray-500">
                  {t('Name')}
                </div>
                <div className="shrink-0 w-[104px] text-xs font-600 text-gray-500">
                  {t('Role')}
                </div>
                <div className="shrink-0 w-[204px] text-xs font-600 text-gray-500">
                  {t('Created At')}
                </div>
                <div className="shrink-0 w-[96px] px-3 text-xs font-600 text-gray-500" />
              </div>
              <div className="min-w-[480px] relative">
                {list.map((member) => (
                  <div
                    className="flex border-b border-gray-100"
                    key={member.id}
                  >
                    <div className="grow flex items-center py-2 px-3">
                      <div className="shrink-0 flex items-center rounded-full w-[24px] h-[24px] text-[24px] bg-blue-600 mr-2">
                        <div className="text-center text-white w-[24px] scale-[0.5]">
                          {member.name[0]}
                        </div>
                      </div>
                      <div>
                        <div className="text-[13px] font-600 text-gray-700 leading-[18px]">
                          {member.name}
                          {/* <span className="text-xs text-gray-500">（你）</span> */}
                        </div>
                        <div className="text-xs text-gray-500 leading-[18px]">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center w-[104px] py-2 text-[13px] text-gray-700">
                      {member.role}
                    </div>
                    <div className="shrink-0 flex items-center w-[204px] py-2 text-[13px] text-gray-700">
                      {member.created_at}
                    </div>
                    <div className="shrink-0 w-[96px] flex items-center">
                      <Tooltip trigger="hover" content="delete">
                        <div
                          className="px-3 text-[13px] text-gray-700"
                          onClick={() => {
                            handleRemove(member)
                          }}
                        >
                          <GarbageBin />
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddMemberModal
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        onAdd={handleAdd}
      />
    </div>
  )
}

export default Members
