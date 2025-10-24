import {Button, Input, Modal} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {MemberTypes} from '../../menus'

function AddMemberModal({visible, onClose, onAdd}) {
  const {t} = useTranslation()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('normal')
  const [open, setOpen] = useState(false)

  const handleAdd = () => {
    if (email) {
      onAdd({email, role})
    }
  }

  const handleShowList = () => {
    setOpen((pre) => !pre)
  }

  useEffect(() => {
    if (!visible) {
      setRole('normal')
      setEmail('')
    }
  }, [visible])
  return (
    <Modal
      visible={visible}
      title={t('Add Members to Workspace')}
      onCancel={onClose}
      unmountOnExit
      maskClosable={false}
      footer={null}
      className="modal"
    >
      <div className="p-6">
        <div className="mb-2 text-sm font-600 text-gray-900">Email</div>
        <div className="mb-8 flex items-stretch">
          <div className="w-full pt-2 outline-none appearance-none text-sm text-gray-900 rounded-lg overflow-y-auto invite-modal_emailsInput__EOZUC react-multi-email  empty">
            <Input
              placeholder={t('Enter Email')}
              value={email}
              onChange={setEmail}
            />
          </div>
        </div>
        <div className="relative pb-6">
          <button
            onClick={handleShowList}
            className="relative w-full py-2 pl-3 pr-10 text-left bg-gray-100 outline-none border-none appearance-none text-sm text-gray-900 "
          >
            <span className="block truncate capitalize">
              {t(`Invite as a ${MemberTypes?.[role]}`)}
            </span>
          </button>
          {open ? (
            <ul
              onBlur={() => {
                setOpen(false)
              }}
              className="absolute w-full py-1 my-2 overflow-auto text-base z-10 bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              {Object.entries(MemberTypes).map(([key, val]) => (
                <li
                  onClick={() => {
                    setRole(key)
                    setOpen(false)
                  }}
                  key={key}
                  className="bg-gray-50 rounded-xl cursor-pointer select-none relative py-2 px-4 mx-2 flex flex-col"
                >
                  <div className="flex flex-row">
                    <span className="text-indigo-600 w-8 flex items-center">
                      {key === role ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className="h-5 w-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : null}
                    </span>
                    <div className=" flex flex-col flex-grow">
                      <span className="font-medium capitalize block truncate">
                        {val}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Button
          type="primary"
          className="w-full rounded-md font-600"
          disabled={!email}
          onClick={handleAdd}
        >
          {t('Add')}
        </Button>
      </div>
    </Modal>
  )
}

export default AddMemberModal
