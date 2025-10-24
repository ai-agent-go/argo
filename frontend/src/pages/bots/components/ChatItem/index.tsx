/* eslint-disable no-nested-ternary */
import {Input, Message, Tooltip} from '@arco-design/web-react'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useParams} from 'react-router-dom'

// import GarbageBin from '~/components/icons/GarbageBin'
import {
  deleteConversation,
  editConversationName,
} from '~/lib/apis/conversations'

import ChatMenu from '../ChatMenu'

function ChatItem({
  chat,
  activeChatId,
  selected,
  handleSelect,
  refresh,
  visibleMenu,
}) {
  const {chatId}: any = useParams()
  const {t} = useTranslation()
  const [confirmEdit, setConfirmEdit] = useState(false)
  const [chatTitle, setChatTitle] = useState(chat.name)

  const editChatTitle = async () => {
    try {
      await editConversationName(chat.id, {
        name: chatTitle,
        auto_generate: false,
      })
      refresh()
      setConfirmEdit(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const deleteHandler = async () => {
    try {
      await deleteConversation(chat.id)
      Message.success(t('Delete Success'))
      await refresh()
      // if (chat.id === activeChatId) {
      //   handleRefreshActive()
      // }
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  // useEffect(() => {
  //   if (selected && !chatId) {
  //     console.log(selected, chatId, '123')
  //     handleSelect({})
  //   }
  // }, [chatId])

  useEffect(() => {
    if (chat) {
      setChatTitle(chat.name)
    }
  }, [chat])

  const renderRight = () => {
    if (confirmEdit) {
      return (
        <div className="flex self-center space-x-1.5 z-10">
          <Tooltip content={t('Confirm')}>
            <button
              aria-label="confirm"
              className=" self-center transition"
              onClick={() => {
                editChatTitle()
                setConfirmEdit(false)
                setChatTitle('')
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Tooltip>

          <Tooltip content={t('Cancel')}>
            <button
              aria-label="cancel"
              className=" self-center transition"
              onClick={() => {
                setConfirmEdit(false)
                setChatTitle('')
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </Tooltip>
        </div>
      )
    }
    return (
      <div className="flex self-center space-x-1 z-10 flex-shrink-0">
        <ChatMenu
          // renameHandler={() => {
          //   setChatTitle(chat.name)
          //   setConfirmEdit(true)
          // }}
          deleteHandler={deleteHandler}
        >
          <button aria-label="Chat Menu" className=" self-center transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
          </button>
        </ChatMenu>
        {chat.id === activeChatId ? (
          <button
            aria-label="delete"
            id="delete-chat-button"
            className="hidden"
            onClick={deleteHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
          </button>
        ) : null}
      </div>
    )
  }

  if (!visibleMenu) {
    return (
      <div
        className={`p-[5px] rounded-[8px] box-border flex-shrink-0 w-[42px] ${
          selected ? 'bg-[#EBEBEB]' : 'hover:bg-[#EBEBEB]'
        }`}
        onClick={() => {
          handleSelect(chat)
        }}
      >
        <Tooltip
          position="right"
          content={
            <div className="min-w-[180px]">
              <div className=" text-left text-[#fff] text-[14px] font-500 self-center overflow-hidden w-[80%] h-[20px] truncate mb-1">
                {chat.bot_name}
              </div>
              <div className=" text-left text-[#fff] text-[10px] self-center overflow-hidden w-full h-[20px] truncate">
                {chat.latest_answer || '-'}
              </div>
            </div>
          }
        >
          <img
            src={chat.bot_icon}
            alt=""
            className={`w-[32px] h-[32px] rounded-[50%] flex-shrink-0 object-cover ${selected ? 'border-[1px] border-[#133EBF]' : ''}`}
          />
        </Tooltip>
      </div>
    )
  }
  return (
    <div className=" w-full pr-2 relative group overflow-hidden flex-shrink-0">
      {confirmEdit ? (
        <div
          className={`w-full flex justify-between rounded-xl px-3 py-2 ${
            selected ? 'bg-gray-100' : 'group-hover:bg-gray-100 '
          }  whitespace-nowrap text-ellipsis`}
        >
          <Input
            value={chatTitle}
            onChange={setChatTitle}
            className=" bg-transparent w-full outline-none mr-10"
          />
        </div>
      ) : (
        // <Link to={`/${$currentWorkspace?.id}/chat/${chat.id}`}>
        <div
          className={` w-full flex justify-between rounded-xl px-3 py-[10px] cursor-pointer ${
            String(chat.id) === String(chatId) || confirmEdit
              ? 'bg-gray-200 '
              : selected
                ? 'bg-gray-100 '
                : ' group-hover:bg-gray-100'
          }  whitespace-nowrap text-ellipsis`}
          onClick={() => {
            handleSelect(chat)
          }}
          draggable="false"
        >
          <div className=" flex self-center flex-1 w-full">
            <img
              src={chat.bot_icon}
              alt=""
              className="w-[42px] h-[42px] rounded-[50%] mr-[10px] flex-shrink-0 object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <div className=" text-left text-[#03060E] text-[14px] font-500 self-center overflow-hidden w-[80%] h-[20px] truncate mb-1">
                {chat.bot_name}
              </div>
              <div className=" text-left text-[#565759] text-[10px] self-center overflow-hidden w-full h-[20px] truncate">
                {chat.latest_answer}
              </div>
            </div>
          </div>
        </div>
        // </Link>
      )}

      <div className="invisible group-hover:visible absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-gradient-to-l from-80% to-transparent">
        {renderRight()}
      </div>
    </div>
  )
}

export default ChatItem
