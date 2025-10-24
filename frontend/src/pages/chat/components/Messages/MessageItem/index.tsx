/* eslint-disable no-nested-ternary */
import {Message, Modal} from '@arco-design/web-react'
import {fetchEventSource} from '@microsoft/fetch-event-source'
import {useAtom} from 'jotai'
import cloneDeep from 'lodash/cloneDeep'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Prompt, useHistory} from 'react-router-dom'

import ResponseMessage from '~/components/chat/Messages/ResponseMessage'
import StopChat from '~/components/chat/Messages/StopChat'
import UserMessage from '~/components/chat/Messages/UserMessage'
import {ERROR_CODE} from '~/constants'
import {stopBotSay} from '~/lib/apis/chats'
import {
  createBranch,
  deleteMessage,
  editMessage,
} from '~/lib/apis/conversations'
import {WEBUI_API_BASE_URL} from '~/lib/constants'
import {activeChat, currentWorkspace, openPlan} from '~/lib/stores'
import {chatsLoading, currentModel} from '~/lib/stores/chat'

import ResponseMore from '../ResponesMore'
import StopItem from '../StopItem'
import UserMore from '../UserMore'

function MessageItem({
  chat: chatInfo,
  detail,
  handleClickExtraItem,
  isLastItem,
  checkVariable,
  playAudioLipSync,
  initAudio,
  refresh,
  handleSubmit,
  interruptEvent: typeA,
  taskContent: tContent,
}) {
  const history = useHistory()
  const {t} = useTranslation()
  const sourceRef = useRef(null)
  const loadingRef = useRef('')
  const stopRef = useRef(true)
  const isUserScroll = useRef(false)
  const isSendMsg = useRef(false)
  const needEditNameRef = useRef(false) // 首次创建的会话需要通过调用接口获取会话名
  const taskId = useRef('') // 每次会话唯一的taskId
  const [$currentModel] = useAtom(currentModel)
  const [$activeChat] = useAtom(activeChat)
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [loading, setLoading] = useAtom(chatsLoading)
  const [deleteInfo, setDeleteInfo] = useState({
    delete_query: false,
    delete_answer: false,
  })
  const [isEditUser, setIsEditUser] = useState(false)
  const [isEditResponse, setIsEditResponse] = useState(false)
  const [chat, setChat] = useState(chatInfo)
  const [sending, setSending] = useState(false)
  const [regenText, setRegenText] = useState('')
  const [eventClose, setEventClose] = useState(false)
  const [interruptEvent, setInterruptEvent] = useState(null)
  const [, setOpenPlan] = useAtom(openPlan)
  const [taskContent, setTaskContent] = useState('')

  const deleteHandler = async (type) => {
    try {
      const params = {
        delete_query: false,
        delete_answer: false,
      }
      if (type === 'query') {
        params.delete_query = true
        deleteInfo.delete_query = true
      } else {
        params.delete_answer = true
        deleteInfo.delete_answer = true
      }
      const data = await deleteMessage(chat.id, params)
      Message.success(t(data.msg))
      setDeleteInfo({...deleteInfo})
    } catch (err) {
      console.log(err)
    }
  }

  const handleEditUser = () => {
    setIsEditUser(true)
  }

  const handleEditResponse = () => {
    setIsEditResponse(true)
  }

  const handleResponseEditConfirm = async (value) => {
    try {
      const editItem = chat.agent_thoughts.filter((v) => !v.tool_type)?.[0]
      const data = await editMessage(chat.id, {
        query: chat.query,
        answer: value,
        final_thought_id: editItem?.id,
      })
      chat.answer = data.answer
      chat.agent_thoughts = data.agent_thoughts
      setIsEditResponse(false)
    } catch (err) {
      Message.error(t(err.msg))
    }
  }

  const handleCreateBranch = async () => {
    try {
      const data = await createBranch(chat.conversation_id, {
        message_id: chat.id,
      })
      Message.success(t('Branch created successfully'))
      history.push(`/bots/${$currentWorkspace.id}/chat/${data.id}`)
    } catch (err) {
      Message.error(t(err.msg))
    }
  }

  const endCurrentChat = async (isStopped = false) => {
    if (!stopRef.current) {
      // audioQueue.clearQueue()
      stopRef.current = true
      setSending(false)
      setRegenText('')
      taskId.current = ''
      setLoading('')
      setChat((pre) => ({...pre, is_stopped: isStopped}))
      refresh()
    }
  }

  const handleRegen = useCallback(
    async ({message}) => {
      const emptyArrays = checkVariable()
      initAudio()
      if (emptyArrays.length > 0) {
        const [itemType] = Object.keys(emptyArrays[0])
        Message.error(`Please Enter Variable ${emptyArrays[0][itemType].label}`)
        return
      }
      setDeleteInfo((pre) => ({...pre, delete_answer: false}))
      if (loadingRef.current) return
      chat.answer = ''
      chat.agent_thoughts = []
      setSending(true)
      setChat({...chat})
      stopRef.current = false

      needEditNameRef.current = !$activeChat.id
      let buffer = ''
      isSendMsg.current = true
      isUserScroll.current = false
      setLoading(chatInfo.id)
      setOpenPlan(false)

      // if ($activeChat?.agent_mode?.strategy === 'react_deep_research') {
      //   $activeChat.detail.model_config.agent_mode.strategy =
      //     'react_deep_research'
      // }
      // if (
      //   [
      //     $activeChat.detail.model_config.agent_mode.strategy,
      //     $activeChat?.agent_mode?.strategy,
      //   ].includes('react_deep_research')
      // ) {
      //   $activeChat.detail.model_config.agent_mode.enabled = true
      // }
      const params = {
        invoke_from: 'web-app',
        message,
        regen_message_id: chat.id,
        // ...$activeChat.detail,
        inputs: $activeChat.inputs,
        bot_id: $activeChat.bot_id,
        space_id: $currentWorkspace.id,
        conversation_id: $activeChat.id || '',
        stream: true,
        files: chat.files,
        model_config: $activeChat.detail.model_config,
      }
      sourceRef.current = new AbortController()
      setInterruptEvent(null)
      fetchEventSource(`${WEBUI_API_BASE_URL}/chat/say`, {
        method: 'POST',
        signal: sourceRef.current.signal,
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'text/event-stream',
          authorization: `Bearer ${localStorage.token}`,
        },
        body: JSON.stringify(params),
        onopen: async (res) => {
          if (!res.ok) {
            const cloned = res.clone()
            const {errcode, msg} = await cloned.json()
            if (errcode < 0) {
              Message.error(
                msg || 'Internal Server Error, please contact support.'
              )
            }
          }
        },
        onmessage: (event) => {
          isSendMsg.current = false
          const data = JSON.parse(event.data || '{}')
          // if (needEditNameRef.current) {
          //   editChatTitle()
          // }
          if (!taskId.current) {
            taskId.current = data.task_id
          }
          if (stopRef.current) return
          setSending(false)
          if (data.event === 'error') {
            setLoading('')
            Modal.error({
              title: 'ERROR',
              content: (
                <div>
                  {data.message}{' '}
                  {ERROR_CODE[data.code] &&
                    ERROR_CODE[data.code]({
                      workspaceId: $currentWorkspace.id,
                      botId: $activeChat.bot_id,
                    })}
                </div>
              ),
            })
          }
          if (data.event === 'message') {
            // message sending
            requestAnimationFrame(async () => {
              if (data.metadata?.langgraph_node?.includes('reporter')) {
                setOpenPlan(true)
              }
              setChat((pre) => {
                pre.answer += data.answer || ''
                // setChat({...chat})
                buffer += data.answer
                const lastIndex = pre.agent_thoughts.length - 1
                if (
                  pre.agent_thoughts[lastIndex] &&
                  pre.agent_thoughts[lastIndex].id
                ) {
                  pre.agent_thoughts.push({
                    thought: buffer,
                  })
                } else if (lastIndex > -1) {
                  pre.agent_thoughts[lastIndex] = {
                    ...pre.agent_thoughts[lastIndex],
                    thought: buffer,
                  }
                }
                const regex = /[….?!。？！]/
                const match = regex.exec(buffer)
                if (match !== null && $currentModel.live2dEnable) {
                  const {index} = match
                  const sentence = buffer.substring(0, index + 1) // 提取一句话
                  const plainText = sentence.replace(/<[^>]*>/g, '')
                  if (index !== 0) {
                    // 如果只有标点则不转语音

                    // console.log(sentence, 'sentence========', index) // 输出句子
                    playAudioLipSync(plainText)

                    // 从缓冲区中移除已经提取的部分
                  }
                  buffer = buffer.substring(index + 1)
                }
                console.log('pre', pre.answer)
                if (data.metadata?.langgraph_node?.includes('reporter')) {
                  pre.reporterAnswer = true
                }
                return {...pre}
              })
            })
          } else if (data.event === 'agent_thought') {
            // agent thinking
            // 替换上面一次message事件
            buffer = ''
            const lastIndex = chat.agent_thoughts.length - 1
            if (lastIndex < 0) {
              chat.agent_thoughts.push(cloneDeep(data))
            } else if (
              chat.agent_thoughts[lastIndex].id &&
              chat.agent_thoughts[lastIndex].id !== data.id
            ) {
              chat.agent_thoughts.push(cloneDeep(data))
            } else {
              chat.agent_thoughts[lastIndex] = cloneDeep(data)
              chat.answer = data.thought
            }
            setChat({...chat})
          } else if (data.event === 'interrupt') {
            setTaskContent(data.answer)
            setInterruptEvent(data)
          } else if (data.event === 'message_end') {
            buffer = ''
          }
        },
        onerror: (err) => {
          isSendMsg.current = false

          Message.error('Internal Server Error, please contact support.')
          sourceRef.current?.abort()

          setLoading('')
          throw err
        },
        onclose: () => {
          requestAnimationFrame(() => {
            isSendMsg.current = false
            setEventClose(true)
            // endCurrentChat()
          })
        },
        openWhenHidden: true,
      })
    },
    [$activeChat]
  )

  const handleStop = async () => {
    try {
      await stopBotSay({
        bot_id: $activeChat.bot_id,
        task_id: taskId.current,
        message_id: chatInfo.id,
      })
      sourceRef.current?.abort()
      endCurrentChat(true)
      // await getConversationMessages()
    } catch (err) {
      Message.error(t(err.msg) || 'Server error, try again later')
    }
    // setLoading(false)
  }

  const handleRegenTrigger = useCallback(
    (message: string) => {
      setChat((prev) => ({...prev, answer: '', agent_thoughts: []}))
      setRegenText(message)
    },
    [chat, regenText]
  )

  const handleUserEditConfirm = (value) => {
    chat.query = value
    setIsEditUser(false)
    handleRegenTrigger(value)
  }

  useEffect(() => {
    if (regenText) {
      handleRegen({message: regenText})
    }
  }, [regenText, handleRegen])

  useEffect(() => {
    if (loadingRef.current !== loading) {
      loadingRef.current = loading
    }
  }, [loading])

  useEffect(() => {
    if (eventClose) {
      setEventClose(false)
      endCurrentChat()
    }
  }, [eventClose])

  useEffect(() => {
    setChat(chatInfo)
  }, [chatInfo])

  useEffect(() => {
    setInterruptEvent(typeA)
  }, [typeA])

  useEffect(() => {
    setTaskContent(tContent)
  }, [tContent])

  return (
    <div key={chat.id}>
      {chat.query !== null && !deleteInfo.delete_query ? (
        <div className="w-full">
          <div className="flex max-w-5xl flex-col justify-between px-5 pb-9 mx-auto rounded-lg group relative">
            <UserMessage
              message={chat.query}
              fileList={chat?.files || []}
              isEdit={isEditUser}
              changeIsEdit={setIsEditUser}
              loading={!!loading}
              handleEditConfirm={handleUserEditConfirm}
            />
            {!loading ? (
              <UserMore
                chat={chat}
                handleRegen={({message}) => handleRegenTrigger(message)}
                deleteHandler={deleteHandler}
                handleEdit={handleEditUser}
              />
            ) : null}
          </div>
        </div>
      ) : null}
      {(chat.answer !== null || chat.agent_thoughts?.length > 0) &&
      !deleteInfo.delete_answer ? (
        <div className={`w-full ${isLastItem ? 'pb-12' : ''} relative`}>
          <div className="flex flex-col justify-between px-5 pb-9 max-w-5xl mx-auto rounded-lg relative group">
            <ResponseMessage
              taskContent={taskContent}
              setInterruptEvent={setInterruptEvent}
              handleSubmit={handleSubmit}
              interruptEvent={interruptEvent}
              handleClickExtraItem={handleClickExtraItem}
              sending={sending}
              message={
                loading
                  ? {...chat}
                  : {
                      ...chat,
                      agent_thoughts:
                        chat.agent_thoughts?.filter((thought) => thought.id) ||
                        [],
                    }
              }
              detail={detail}
              isEdit={isEditResponse}
              changeIsEdit={setIsEditResponse}
              loading={loading && loading === chatInfo.id}
              handleEditConfirm={handleResponseEditConfirm}
              nameColor={detail.background_img ? '#F2F2F2' : '#AEAFB3'}
            />
            {!loading ? (
              !chat.is_stopped ? (
                <ResponseMore
                  chat={chat}
                  handleRegen={({message}) => handleRegenTrigger(message)}
                  deleteHandler={deleteHandler}
                  handleEdit={handleEditResponse}
                  createBranch={handleCreateBranch}
                />
              ) : (
                <StopItem handleRegen={() => handleRegenTrigger(chat.query)} />
              )
            ) : null}
          </div>
        </div>
      ) : null}
      <StopChat
        loading={loading && loading === chatInfo.id}
        handleStop={handleStop}
      />

      <Prompt
        when={isEditResponse || isEditUser}
        message={t(
          'The current modifications have not been saved. Are you sure you want to leave?'
        )}
      />
    </div>
  )
}

export default React.memo(MessageItem)
