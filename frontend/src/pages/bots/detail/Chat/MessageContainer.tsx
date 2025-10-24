import {Message, Modal} from '@arco-design/web-react'
import {fetchEventSource} from '@microsoft/fetch-event-source'
import {useAtom} from 'jotai'
import cloneDeep from 'lodash/cloneDeep'
import throttle from 'lodash/throttle'
import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import MessageInput from '~/components/chat/MessageInput'
import ResponseMessage from '~/components/chat/Messages/ResponseMessage'
import StopChat from '~/components/chat/Messages/StopChat'
import Installation from '~/components/Installation/Installation'
import {ERROR_CODE} from '~/constants'
import {getBotList} from '~/lib/apis/bots'
import {stopBotSay} from '~/lib/apis/chats'
import {WEBUI_API_BASE_URL} from '~/lib/constants'
import {openPlan} from '~/lib/stores'
import {chatsLoading} from '~/lib/stores/chat'
import ClearIcon from '~/pages/assets/ClearIcon.svg'
import QuickBack from '~/pages/chat/components/QuickBack'
import {awaitTime} from '~/utils'

import Messages from './Messages'

function MessageContainer({
  refresh,
  detail,
  spaceId,
  isSave,
  showUpload,
  handleClickExtraItem,
  modelList,
  setLoading: changeLoading,
  setSending: changeSending,
}) {
  const {t} = useTranslation()
  const conversationId = useRef('')

  const containerRef = useRef(null)
  const sourceRef = useRef(null)
  const stopRef = useRef(true)
  const scrollContainerRef = useRef(null)
  const messageId = useRef(null)
  const lastScrollTop = useRef(0)
  const isUserScroll = useRef(false)
  const isSendMsg = useRef(false)
  const taskId = useRef('') // 每次会话唯一的taskId
  const [loading, setLoading] = useAtom(chatsLoading)
  const [chatList, setChatList] = useState([])
  const [showResponse, setShowResponse] = useState(false) // 展示打字机效果回复内容
  // const [loading, setLoading] = useState('') // 等待回复
  const [sending, setSending] = useState(false) // 正在发送
  const [response, setResponse] = useState({
    answer: '',
    agent_thoughts: [],
    reporterAnswer: false,
  })
  const [eventClose, setEventClose] = useState(false)
  const [installed, setInstalled] = useState(true)
  const [unEdit, setUnEdit] = useState(false)
  const [editPlanMode, setEditPlanMode] = useState(false)
  const [, setOpenPlan] = useAtom(openPlan)
  const [interruptEvent, setInterruptEvent] = useState('')

  const [taskContent, setTaskContent] = useState('')

  const checkVariable = () => {
    const inputForm = detail.model_config.user_input_form
    const values = detail.inputs || {}
    const needInputs = inputForm.filter((v) => {
      const [itemType] = Object.keys(v)
      const {required, variable} = v[itemType]
      if (required && values[variable] === undefined) {
        return true
      }
      return false
    })
    return needInputs
  }

  const endCurrentChat = async (iStopped = false) => {
    if (!stopRef.current) {
      stopRef.current = true
      setSending(false)
      taskId.current = ''
      const curChat = chatList?.find((v) => v.id === messageId.current)
      if (curChat) {
        curChat.answer = response.answer
        curChat.agent_thoughts = cloneDeep(response.agent_thoughts)
        curChat.is_stopped = iStopped
        curChat.conversation_id = conversationId.current
      }
      messageId.current = ''
      setShowResponse(false)
      setLoading('')
      setResponse({answer: '', agent_thoughts: [], reporterAnswer: false})
      // refresh()
    }
  }

  const handleStop = async () => {
    try {
      await stopBotSay({
        bot_id: detail.id,
        task_id: taskId.current,
        message_id: messageId.current,
      })
      sourceRef.current?.abort()
      endCurrentChat(true)
      setLoading('')
      // await getConversationMessages()
      setResponse({answer: '', agent_thoughts: [], reporterAnswer: false})
      setSending(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    // setLoading(false)
  }

  const handleRestart = async () => {
    setChatList([])
    setShowResponse(false)
    conversationId.current = ''
  }

  const handleSubmit = async ({message, fileList, editPlanText}) => {
    // 如果是触发Edit plan模式
    if (editPlanText) {
      setEditPlanMode(editPlanText)
      return
    }
    const emptyArrays = checkVariable()
    await awaitTime(100)
    if (emptyArrays.length > 0) {
      const [itemType] = Object.keys(emptyArrays[0])
      Message.error(`Please Enter Variable ${emptyArrays[0][itemType].label}`)
      return
    }
    if (loading) return
    if (showResponse) {
      setResponse({answer: '', agent_thoughts: [{}], reporterAnswer: false})
      setSending(false)
      setShowResponse(false)
    }
    stopRef.current = false

    const newChat = {
      id: message,
      query: message,
      files: fileList,
      answer: null,
    }

    let buffer = ''
    setChatList((pre) => {
      if (pre) {
        return [...pre, newChat]
      }
      return [newChat]
    })
    setShowResponse(true)
    response.answer = ''
    response.agent_thoughts = []
    setSending(true)
    setResponse(cloneDeep(response))
    containerRef.current?.scrollIntoView({
      block: 'end',
      inline: 'end',
    })
    isSendMsg.current = true
    isUserScroll.current = false
    setLoading(newChat.id)
    setOpenPlan(false)
    const params = {
      invoke_from: 'debugger',
      message,
      bot_id: detail.id,
      space_id: spaceId,
      conversation_id: conversationId.current,
      stream: true,
      files: fileList?.map((v) => ({id: v.id, type: v.type, name: v.name})),
      ...detail,
      model_config: {
        ...detail.model_config,
        agent_mode: {
          max_iteration: 4,
          enabled: true,
          strategy: 'react',
          tools: [],
          prompt: null,
          ...detail?.model_config?.agent_mode,
        },
      },
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
        if (!conversationId.current) {
          conversationId.current = data.conversation_id || ''
        }
        if (!taskId.current) {
          taskId.current = data.task_id
        }
        if (messageId.current !== data.id) {
          messageId.current = data.id || data.message_id
          newChat.id = messageId.current
          setLoading(messageId.current)
        }
        if (stopRef.current) return
        setSending(false)
        if (data.event === 'error') {
          // Message.error(data.message)
          // response.sending = false
          // response.message = data.message
          setLoading('')
          setShowResponse(false)
          setEventClose(true)

          Modal.error({
            title: 'ERROR',
            content: (
              <div>
                {data.message}{' '}
                {ERROR_CODE[data.code] &&
                  ERROR_CODE[data.code]({
                    workspaceId: spaceId,
                    botId: detail.id,
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
            setResponse((pre) => {
              pre.answer += data.answer || ''
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
              // setResponse(cloneDeep(response))
              // setResponse(cloneDeep(response))

              if (!isUserScroll.current) {
                containerRef.current?.scrollIntoView({
                  block: 'end',
                  inline: 'end',
                })
              }
              if (data.metadata?.langgraph_node?.includes('reporter')) {
                pre.reporterAnswer = true
              }
              return cloneDeep(pre)
            })
          })
        } else if (data.event === 'agent_thought') {
          // agent thinking
          // 替换上面一次message事件
          buffer = ''
          const lastIndex = response.agent_thoughts.length - 1
          if (lastIndex < 0) {
            response.agent_thoughts.push(cloneDeep(data))
          } else if (
            response.agent_thoughts[lastIndex].id &&
            response.agent_thoughts[lastIndex].id !== data.id
          ) {
            response.agent_thoughts.push(cloneDeep(data))
          } else {
            response.agent_thoughts[lastIndex] = cloneDeep(data)
            response.answer = data.thought
          }
          setResponse(cloneDeep(response))

          if (!isUserScroll.current) {
            containerRef.current?.scrollIntoView({
              block: 'end',
              inline: 'end',
            })
          }
        } else if (data.event === 'interrupt') {
          setTaskContent(data.answer)
          setInterruptEvent(data)
        } else if (data.event === 'message_end') {
          requestAnimationFrame(() => {
            buffer = ''
          })
          // message end
          // console.log('message_end')
          // setShowResponse(false)
        }
      },
      onerror: (err) => {
        isSendMsg.current = false

        Message.error('Internal Server Error, please contact support.')
        sourceRef.current?.abort()
        setResponse({answer: '', agent_thoughts: [], reporterAnswer: false})
        setSending(false)
        setLoading('')
        setShowResponse(false)
        throw err
      },
      onclose: () => {
        requestAnimationFrame(() => {
          isSendMsg.current = false
          setEventClose(true)
        })

        // requestAnimationFrame(() => {
        //   isSendMsg.current = false
        //   console.log('=====stream close=====')
        //   endCurrentChat()
        // })
      },
      openWhenHidden: true,
    })
  }

  useEffect(() => {
    if (eventClose) {
      endCurrentChat()
      setEventClose(false)
    }
  }, [eventClose])

  const getBot = async () => {
    const data = await getBotList({space_id: spaceId})
    const bot = data.bots.find((item) => item.id === detail.id)
    setInstalled(!['fail', 'uninstall', 'installing'].includes(bot.status))
    // 没有模型，需要编辑的bot
    setUnEdit(bot.status === 'Unedited')
  }

  const handleScroll = throttle(() => {
    const element = scrollContainerRef.current
    if (!element) return
    const {scrollTop: currentScrollTop, clientHeight, scrollHeight} = element

    if (currentScrollTop < lastScrollTop.current - 20 && !isSendMsg.current) {
      // 用户向上滚动
      isUserScroll.current = true
    }
    if (
      currentScrollTop > lastScrollTop.current &&
      currentScrollTop + clientHeight >= scrollHeight
    ) {
      // 滚动到最底部
      isUserScroll.current = false
    }

    lastScrollTop.current = currentScrollTop
  }, 100)

  const handleScrollBottom = () => {
    containerRef.current.scrollIntoView({block: 'end', inline: 'end'})
  }

  useEffect(() => {
    if (scrollContainerRef.current && chatList.length > 0) {
      scrollContainerRef.current.removeEventListener('scroll', handleScroll)
      scrollContainerRef.current.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [chatList])

  useEffect(() => {
    return () => {
      stopRef.current = true
      setLoading('')
      // if (!stopRef.current) {
      //   handleStop()
      // }
    }
  }, [])

  useEffect(() => {
    if (detail.id) {
      getBot()
    }
  }, [detail.id])

  useEffect(() => {
    if (isSave && !(installed || unEdit)) {
      getBot()
    }
  }, [isSave])

  useEffect(() => {
    changeLoading(stopRef.current)
  }, [stopRef.current])

  useEffect(() => {
    changeSending(sending)
  }, [sending])

  return (
    <div className="flex flex-col z-10 flex-1 overflow-hidden px-[70px]">
      <div className="flex flex-1 overflow-hidden">
        {installed || unEdit ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="pb-2.5 flex flex-col justify-between w-full h-full max-w-full z-10 relative flex-1 overflow-hidden">
              <div
                className="h-full w-full flex flex-col pt-4 overflow-y-scroll mask no-scrollbar"
                ref={scrollContainerRef}
              >
                <div className="flex-1">
                  <Messages
                    handleSubmit={handleSubmit}
                    interruptEvent={interruptEvent}
                    setInterruptEvent={setInterruptEvent}
                    chatList={chatList}
                    taskContent={taskContent}
                    detail={detail}
                    prologue={t(detail.model_config.prologue)}
                    checkVariable={checkVariable}
                    conversationId={conversationId.current}
                    handleClickExtraItem={handleClickExtraItem}
                  />
                  {showResponse ? (
                    <div className="px-5 mb-3 max-w-5xl rounded-lg group mx-auto">
                      <ResponseMessage
                        handleSubmit={handleSubmit}
                        setInterruptEvent={setInterruptEvent}
                        sending={sending}
                        message={{...response}}
                        detail={detail}
                        loading={!stopRef.current}
                        handleClickExtraItem={handleClickExtraItem}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="w-full h-1" ref={containerRef} />
              </div>

              <StopChat
                loading={loading && messageId.current === loading}
                handleStop={handleStop}
              />
              <QuickBack
                scrollRef={scrollContainerRef}
                handleScroll={handleScrollBottom}
                loading={loading}
              />
            </div>
            <div className="flex items-center gap-[14px] mb-[14px]">
              <div
                onClick={handleRestart}
                className="bg-white border-[0.5px] text-[#03060E] text-[14px] cursor-pointer h-[30px]  border-[#EBEBEB] py-1 px-4 flex items-center gap-[3px] rounded-[8px]"
              >
                <img src={ClearIcon} alt="" />
                {t('Clear')}
              </div>
            </div>
            <MessageInput
              upLoadDisable={!installed}
              isShowModel={false}
              modelList={modelList}
              modelValue={detail?.model_config?.model}
              disabled={!detail?.model_config?.model?.name || !installed}
              handleSubmit={handleSubmit}
              loading={loading}
              showUpload={showUpload}
              editPlanMode={editPlanMode}
              onEditPlanModeChange={setEditPlanMode}
            />
          </div>
        ) : (
          <div className="w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
            <Installation
              detail={detail}
              botId={detail.id}
              spaceId={spaceId}
              isEdit
              refresh={refresh}
              setInstalled={(value) => setInstalled(value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageContainer
