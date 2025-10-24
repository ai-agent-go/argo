import {useAtom} from 'jotai'
import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'

import {getConversations} from '~/lib/apis/conversations'
import {activeChat, chats, currentWorkspace, workspaces} from '~/lib/stores'
import {botDetail, initBotDetail} from '~/lib/stores/chat'

import ChatItem from '../ChatItem'

function ChatList({visibleMenu}) {
  const history = useHistory()
  const [$chats, setActiveChatList] = useAtom(chats)
  const [, setBotDetail] = useAtom(botDetail)
  const [$activeChat, setActiveChat] = useAtom(activeChat)
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [$workspaces] = useAtom(workspaces)

  const getConversationList = async () => {
    const data = await getConversations({
      limit: 9999999,
    })
    setActiveChatList(data.data || [])
  }

  useEffect(() => {
    const curChat = $chats.find((v) => v.id === $activeChat?.id)
    if ($activeChat?.id && !$activeChat?.name && curChat) {
      setActiveChat((pre) => ({...pre, ...curChat, model_id: ''}))
    }
    if (!curChat && $activeChat.name) {
      const curWorkspaceId = $currentWorkspace?.id || $workspaces?.[0]?.id
      if ($chats.length > 0) {
        setActiveChat((pre) => ({
          ...pre,
          ...$chats[0],
          model_id: '',
          detail: {},
        }))
        history.replace(`/bots/${curWorkspaceId}/chat/${$chats[0].id}`)
        // setActiveChat($chats[0])
      } else {
        history.replace(`/bots/${curWorkspaceId}/chat`)
      }
    }
  }, [$activeChat, $chats])

  useEffect(() => {
    getConversationList()
  }, [])

  return (
    <div className="my-2 w-full flex-1 flex flex-col space-y-1 flex-shrink-0 overflow-y-auto no-scrollbar">
      {$chats
        .filter((v) => v.bot_id)
        .map((chat) => {
          return (
            <ChatItem
              key={chat.id}
              visibleMenu={visibleMenu}
              chat={chat}
              refresh={getConversationList}
              selected={$activeChat?.id === chat.id}
              activeChatId={$activeChat?.id || ''}
              handleSelect={(v) => {
                setBotDetail({...initBotDetail()})
                setActiveChat({...v})
                if (v.id) {
                  history.replace(
                    `/bots/${$currentWorkspace?.id}/chat/${chat.id}`
                  )
                }
              }}
            />
          )
        })}
    </div>
  )
}

export default ChatList
