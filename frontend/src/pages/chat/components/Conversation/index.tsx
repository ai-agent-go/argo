import {Message, Modal, Spin} from '@arco-design/web-react'
import {fetchEventSource} from '@microsoft/fetch-event-source'
import {useAtom} from 'jotai'
import cloneDeep from 'lodash/cloneDeep'
import throttle from 'lodash/throttle'
import {memo, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import MessageInput from '~/components/chat/MessageInput'
import ResponseMessage from '~/components/chat/Messages/ResponseMessage'
import StopChat from '~/components/chat/Messages/StopChat'
import {ERROR_CODE} from '~/constants'
import {getTTSVoice} from '~/lib/apis/bots'
import {stopBotSay} from '~/lib/apis/chats'
import {deleteMessages, getConversationDetail} from '~/lib/apis/conversations'
import {WEBUI_API_BASE_URL} from '~/lib/constants'
import TaskQueue from '~/lib/model/taskQueue'
import {activeChat, openPlan} from '~/lib/stores'
import {
  botDetail,
  chatsLoading,
  currentModel,
  live2dModel,
} from '~/lib/stores/chat'
import ClearIcon from '~/pages/assets/ClearIcon.svg'
import EditIcon from '~/pages/assets/EditIcon'
import {awaitTime} from '~/utils'

import {useModelStore} from '../../store/useModelStore'
import GreetingContainer from '../Greeting'
import Messages from '../Messages'
import QuickBack from '../QuickBack'

function Conversation({
  refresh,
  showUpload,
  spaceId,
  createChat,
  chatId,
  currentChatId,
  handleClickExtraItem,
  setLoading: changeLoading,
  setSending: changeSending,
}) {
  // const models = useSyncExternalStore(
  //   (callback) => modelStore.subscribe(callback),
  //   () => modelStore.getModels()
  // )
  const {t} = useTranslation()
  const audioQueue = new TaskQueue()
  const getVoiceQueue = new TaskQueue()
  const containerRef = useRef(null)
  const sourceRef = useRef(null)
  const stopRef = useRef(true)
  const scrollContainerRef = useRef(null)
  const messageId = useRef(null)
  const lastScrollTop = useRef(0)
  const isUserScroll = useRef(false)
  const isSendMsg = useRef(false)
  const needEditNameRef = useRef(false) // 首次创建的会话需要通过调用接口获取会话名
  const taskId = useRef('') // 每次会话唯一的taskId
  const [loading, setLoading] = useAtom(chatsLoading)
  const [$live2dModel] = useAtom(live2dModel)
  const [$currentModel] = useAtom(currentModel)
  const [$activeChat, setActiveChat] = useAtom(activeChat)
  const [$botDetail, setBotDetail] = useAtom(botDetail)
  const [chatList, setChatList] = useState(undefined)
  // const [models, setModelList] = useState([])
  const [showResponse, setShowResponse] = useState(false) // 展示打字机效果回复内容
  // const [loading, setLoading] = useState('') // 等待回复
  const [sending, setSending] = useState(false) // 正在发送
  const [response, setResponse] = useState({
    answer: '',
    agent_thoughts: [],
    reporterAnswer: false,
  })
  const [editPlanMode, setEditPlanMode] = useState(null)
  const [eventClose, setEventClose] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true) // 新增初始化加载状态

  const [interruptEvent, setInterruptEvent] = useState('')

  const [taskContent, setTaskContent] = useState('')

  const [, setOpenPlan] = useAtom(openPlan)

  const {models} = useModelStore()
  // const handleModelList = async () => {
  //   const res = await getModelList({
  //     is_generation: true,
  //   })
  //   setModelList(res.model_list)
  // }

  const getConversationMessages = async () => {
    if (!$activeChat.id) {
      setIsInitialLoading(false)
      return
    }
    try {
      const data = await getConversationDetail({
        conversation_id: $activeChat.id,
        limit: 99999,
      })
      // 先不直接设置 chatList，暂时保存到临时变量
      const messages = data.data || []
      const shouldEditName = messages.length === 0

      // 批量更新状态
      setChatList(messages)
      setIsInitialLoading(false)
      needEditNameRef.current = shouldEditName

      // 在下一个事件循环处理滚动
      requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({
          block: 'end',
          inline: 'end',
          behavior: 'auto',
        })
      })
    } catch (err) {
      console.error('Error fetching conversation messages:', err)
      setIsInitialLoading(false)
    }
  }

  const checkVariable = () => {
    const inputForm = $activeChat.detail.model_config.user_input_form
    const values = $activeChat.inputs || {}
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
        curChat.conversation_id = currentChatId
      } else {
        await getConversationMessages()
      }
      messageId.current = ''
      setShowResponse(false)
      setLoading('')
      setResponse({answer: '', agent_thoughts: [], reporterAnswer: false})
      refresh()
    }
  }

  const handleStop = async () => {
    try {
      await stopBotSay({
        bot_id: $activeChat.bot_id,
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
    const data = await deleteMessages($activeChat.id)
    if (data.msg.includes('success')) {
      setChatList([])
      setShowResponse(false)
    } else {
      Message.error(data.msg || 'Server error, try again later')
    }
  }

  const handleNewChat = () => {
    window.location.href = `${window.location.origin}/bots/${spaceId}/chat?botId=${$botDetail.id}`
  }

  const playAudioLipSync = (text) => {
    if (!$live2dModel.checkModelLoaded()) return
    if (!$currentModel.voiceEnable) {
      $live2dModel.setExpressionWithText($currentModel?.emotionMap || {}, text)
      $live2dModel.setMotionWithText($currentModel?.motionMap || {}, text)
      audioQueue.clearQueue()
      $live2dModel?.stopSpeaking()
      return
    }
    getVoiceQueue.addTask(async () => {
      const {data: voice} = await getTTSVoice({
        tts_type: 'edge_tts',
        tts_params: {
          text: text.replaceAll('*', ''),
          voice: $currentModel.voice,
          rate: '+0%',
          volume: '+100%',
        },
      })
      audioQueue.addTask(() => {
        return new Promise((resolve) => {
          $live2dModel.setExpressionWithText(
            $currentModel?.emotionMap || {},
            text
          )
          $live2dModel.setMotionWithText($currentModel?.motionMap || {}, text)
          $live2dModel.speak(voice).then(() => {
            resolve(1)
          })
        })
      })
    })
  }

  const handleChangeModel = (model) => {
    if (
      model?.category?.category_label?.category?.findIndex(
        (v) => v.category === 'tools'
      ) < 0
    ) {
      $botDetail.model_config.agent_mode.enabled = false
    } else if (
      model?.category?.category_label?.category?.findIndex(
        (v) => v.category === 'tools'
      ) > -1 &&
      $botDetail.model_config.agent_mode.tools.filter(
        (v) => v.type === 'mcp_tool' && v.enabled
      ).length > 0
    ) {
      $botDetail.model_config.agent_mode.enabled = true
    }
    $botDetail.model_config.model = {
      ...$botDetail.model_config.model,
      name: model.model_name,
      model_id: model.id,
      provider: model.provider,
    }
    $activeChat.detail.model_config = $botDetail.model_config
    setActiveChat(cloneDeep($activeChat))
    setBotDetail(cloneDeep($botDetail))
  }

  const handleChangeTools = (value) => {
    const knowledgeList = $botDetail.model_config.agent_mode.tools.filter(
      (v) => v.type === 'dataset'
    )
    $botDetail.model_config.agent_mode.tools = [...knowledgeList, ...value]
    const enabled =
      value.length > 0 && value.filter((v) => v.enabled).length > 0
    $botDetail.model_config.agent_mode.enabled = enabled
    setBotDetail(cloneDeep($botDetail))
    $activeChat.detail.model_config = $botDetail.model_config
    setActiveChat(cloneDeep($activeChat))
  }

  const handleChangeDeepSearch = (value) => {
    if (
      !('strategy' in ($activeChat?.detail?.model_config?.agent_mode ?? {}))
    ) {
      return
    }
    const tools = $botDetail.model_config.agent_mode.tools.filter(
      (v) => v.type !== 'dataset'
    )
    if (value !== 'react_deep_research' && !tools?.length) {
      $botDetail.model_config.agent_mode.enabled = false
    } else {
      $botDetail.model_config.agent_mode.enabled = true
    }
    $botDetail.model_config.agent_mode.strategy = value
    setBotDetail(cloneDeep($botDetail))
    if ($activeChat?.agent_mode?.strategy) {
      $activeChat.agent_mode.strategy = value
    }
    $activeChat.detail.model_config.agent_mode.strategy = value
    setActiveChat(cloneDeep($activeChat))
  }

  const initAudio = () => {
    audioQueue.clearQueue()
    $live2dModel?.stopSpeaking()
  }

  const handleSubmit = async ({message, fileList, editPlanText}) => {
    // 如果是触发Edit plan模式
    if (editPlanText) {
      setEditPlanMode(editPlanText)
      return
    }
    const emptyArrays = checkVariable()
    await awaitTime(100)
    initAudio()
    if (emptyArrays.length > 0) {
      const [itemType] = Object.keys(emptyArrays[0])
      Message.error(`Please Enter Variable ${emptyArrays[0][itemType].label}`)
      return
    }
    if (loading) return
    if (showResponse) {
      await getConversationMessages()
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
    needEditNameRef.current = !$activeChat.id
    await createChat()
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
    if ($activeChat?.agent_mode?.strategy === 'react_deep_research') {
      $activeChat.detail.model_config.agent_mode.strategy =
        'react_deep_research'
    }
    if (
      [
        $activeChat.detail.model_config.agent_mode.strategy,
        $activeChat?.agent_mode?.strategy,
      ].includes('react_deep_research')
    ) {
      $activeChat.detail.model_config.agent_mode.enabled = true
    }
    const params = {
      invoke_from: 'web-app',
      message,
      // ...$activeChat.detail,
      inputs: $activeChat.inputs,
      bot_id: $activeChat.bot_id,
      space_id: spaceId,
      conversation_id: $activeChat.id || '',
      stream: true,
      files: fileList?.map((v) => ({
        id: v.id,
        type: v.type,
        name: v.name,
        url: v.url,
        transfer_method: 'local_file',
      })),
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
        if (messageId.current !== data.id) {
          messageId.current = data.id || ''
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
          Modal.error({
            title: 'ERROR',
            content: (
              <div>
                {data.message}{' '}
                {ERROR_CODE[data.code] &&
                  ERROR_CODE[data.code]({
                    workspaceId: spaceId,
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
          buffer = ''
          // message end
          // console.log('message_end')
          // debugger;setShowResponse(false)
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
    if (!$activeChat || !$activeChat.id) {
      setIsInitialLoading(false)
    }
    if (
      $activeChat.id &&
      // $botDetail.id &&
      (!chatList || chatList.length === 0) &&
      stopRef.current
    ) {
      getConversationMessages()
    }
  }, [$activeChat])

  useEffect(() => {
    return () => {
      stopRef.current = true
      setLoading('')
      // if (!stopRef.current) {
      //   handleStop()
      // }
      audioQueue.clearQueue()
    }
  }, [])

  useEffect(() => {
    changeLoading(stopRef.current)
  }, [stopRef.current])

  useEffect(() => {
    changeSending(sending)
  }, [sending])

  return (
    <div className="flex flex-col z-10 flex-1 h-full overflow-hidden px-5 box-border">
      <div className="flex flex-1 overflow-hidden">
        {isInitialLoading ? (
          <div className="w-full p-4 h-full flex items-center justify-center">
            <Spin dot />
          </div>
        ) : (
          <>
            {!chatId && (!chatList || chatList?.length === 0) ? (
              <GreetingContainer detail={$botDetail} />
            ) : null}
            {chatList && chatList.length > 0 ? (
              <div className="pb-2.5 flex flex-col justify-between w-full h-full max-w-full z-10 relative flex-1 overflow-hidden">
                <div
                  className="h-full w-full flex flex-col pt-4 overflow-y-scroll mask no-scrollbar"
                  ref={scrollContainerRef}
                >
                  <div>
                    <Messages
                      interruptEvent={interruptEvent}
                      setInterruptEvent={setInterruptEvent}
                      handleSubmit={handleSubmit}
                      taskContent={taskContent}
                      chatList={chatList}
                      detail={$botDetail}
                      prologue={t($botDetail.model_config.prologue)}
                      checkVariable={checkVariable}
                      playAudioLipSync={playAudioLipSync}
                      refresh={refresh}
                      // loading={loading}
                      // setLoading={setLoading}
                      initAudio={initAudio}
                      handleClickExtraItem={handleClickExtraItem}
                    />
                    {showResponse ? (
                      <div className="px-5 mb-3 max-w-5xl rounded-lg group mx-auto">
                        <ResponseMessage
                          handleSubmit={handleSubmit}
                          taskContent={taskContent}
                          interruptEvent={interruptEvent}
                          setInterruptEvent={setInterruptEvent}
                          sending={sending}
                          message={{...response}}
                          detail={$botDetail}
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
            ) : null}
          </>
        )}
      </div>
      <div className="flex items-center gap-[14px] mb-[14px]">
        <div
          onClick={handleNewChat}
          className="bg-white border-[0.5px] text-[#03060E] text-[14px] cursor-pointer h-[30px]  border-[#EBEBEB] py-1 px-4 flex items-center gap-[3px] rounded-[8px]"
        >
          <EditIcon />
          {t('New Chat')}
        </div>
        <div
          onClick={handleRestart}
          className="bg-white border-[0.5px] text-[#03060E] text-[14px] cursor-pointer h-[30px]  border-[#EBEBEB] py-1 px-4 flex items-center gap-[3px] rounded-[8px]"
        >
          <img src={ClearIcon} alt="" />
          {t('Clear')}
        </div>
      </div>
      <MessageInput
        disabled={!$activeChat.bot_id}
        handleSubmit={handleSubmit}
        loading={loading}
        showUpload={showUpload}
        disabledSelectedModel={!$botDetail.locked}
        modelList={models}
        modelValue={$botDetail.model_config?.model}
        changeModel={handleChangeModel}
        detail={$botDetail}
        changeTools={handleChangeTools}
        handleChangeDeepSearch={handleChangeDeepSearch}
        editPlanMode={editPlanMode}
        onEditPlanModeChange={setEditPlanMode}
      />
    </div>
  )
}

export default memo(Conversation)
