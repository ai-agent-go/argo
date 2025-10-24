import {Message} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import cloneDeep from 'lodash/cloneDeep'
import qs from 'query-string'
import React, {useEffect, useRef, useState} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'

import HTMLArtifact from '~/components/artifacts/HTMLArtifact'
import SvgArtifact from '~/components/artifacts/SvgArtifact'
import ExtraModal from '~/components/chat/Messages/ExtraModal'
import NavBar from '~/components/Navbar/Navbar'
import StartPlan from '~/components/StartPlan/StartPlan'
import {getBotConfig} from '~/lib/apis/bots'
import {createConversation, getConversations} from '~/lib/apis/conversations'
import {createTempKnowledge} from '~/lib/apis/knowledge'
import {activeChat, artifacts, chats, openPlan} from '~/lib/stores'
import {
  botDetail,
  currentModel,
  initBotDetail,
  live2dModel,
  selectedKnowledge,
} from '~/lib/stores/chat'
import {mergeObjects} from '~/lib/utils'

import Conversation from './components/Conversation'
import RightDrawer from './components/RightDrawer'
import {useModelStore} from './store/useModelStore'

/*
  会话页的情况：
  从机器人页面跳转进来的首次新会话
  首次对话后url改变，页面刷新
  
  1. 拿到botId获取bot详情
  2. 对话列表

*/
function Chat() {
  // eslint-disable-next-line prefer-const
  let {chatId = '', spaceId} = useParams<{chatId?: string; spaceId: string}>()
  const {botId} = qs.parse(useLocation().search)
  const history = useHistory()
  const urlChatId = useRef(chatId)

  const [$activeChat, setActiveChat] = useAtom(activeChat)
  const [$artifacts, setArtifact] = useAtom(artifacts)
  const [, setCurrentModel] = useAtom(currentModel)
  const [$live2dModel, setLive2dModel] = useAtom(live2dModel)
  const [$botDetail, setBotDetail] = useAtom(botDetail)
  const [visible, setVisible] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [, setSelectedKnowledge] = useAtom(selectedKnowledge)
  const [showUpload, setShowUpload] = useState(false)
  const [visibleExtra, setVisibleExtra] = useState(false)
  const [extraInfo, setExtraInfo] = useState<any>({})
  // const [showRight, setShowRight] = useState(true)00
  const [, setChats] = useAtom(chats)
  const {models, updateModels} = useModelStore()

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [, setOpenPlan] = useAtom(openPlan)

  const [$openPlan] = useAtom(openPlan)
  const getModelDetail = async () => {
    if (models.length === 0) {
      await updateModels()
    }

    if (models.length > 0 && $activeChat.model_name) {
      const info = models.find(
        (v) =>
          v.model_name === $activeChat.model_name &&
          v.provider === $activeChat.model_provider
      )
      $botDetail.model_config.model = {
        ...$botDetail.model_config.model,
        model_id: info?.id,
        name: $activeChat.model_name,
        provider: $activeChat.model_provider,
      }
    } else {
      $botDetail.model_config.model = {
        ...$botDetail.model_config.model,
        name: $activeChat.model_name,
        provider: $activeChat.model_provider,
        id: '',
      }
    }
    setCurrentModel(cloneDeep($botDetail.model_config.model))
    setBotDetail(cloneDeep($botDetail))
  }

  const getBotDetail = async () => {
    if (!$activeChat.bot_id) {
      return
    }
    let modelsList = models
    if (models.length === 0) {
      modelsList = await updateModels()
    }
    const detail = await getBotConfig($activeChat.bot_id)

    let knowledge =
      detail?.model_config?.agent_mode?.tools.filter(
        (v) => v.type === 'dataset'
      ) || []

    if (
      $activeChat.tools &&
      $activeChat.tools.filter((v) => v.type === 'dataset').length > 0
    ) {
      knowledge = $activeChat.tools.filter((v) => v.type === 'dataset')
    }
    setSelectedKnowledge(knowledge)
    let inputs = {}
    if ($activeChat.id === chatId || !chatId) {
      inputs = $activeChat.inputs
    } else {
      detail?.model_config?.user_input_form?.forEach((v) => {
        const {variable, default: defaultValue}: any = Object.values(v)[0]
        inputs[variable] = defaultValue
      })
    }

    $activeChat.inputs = inputs
    $activeChat.knowledge = knowledge
    if (!$activeChat.tools) {
      $activeChat.tools =
        detail?.model_config?.agent_mode?.tools.filter(
          (v) => v.type === 'mcp_tool'
        ) || []
    }
    $activeChat.hasKnowledge = knowledge.length > 0
    const chatModel = modelsList.find(
      (item) =>
        (item.model_name === $activeChat.model_name &&
          item.provider === $activeChat.model_provider) ||
        item.id === detail.model_config.model.model_id
    )
    if (
      chatModel?.category?.category_label?.category?.findIndex(
        (v) => v.category === 'tools'
      ) > -1 &&
      $activeChat?.tools?.findIndex((v) => v.type === 'mcp_tool' && v.enabled) >
        -1
    ) {
      detail.model_config.agent_mode.enabled = true
      detail.model_config.agent_mode.tools = [
        ...knowledge,
        ...$activeChat.tools.filter((v) => v.type === 'mcp_tool'),
      ]
    } else {
      detail.model_config.agent_mode.enabled = false
      detail.model_config.agent_mode.tools = [...knowledge]
    }
    if ($botDetail?.model_config?.model?.name) {
      detail.model_config.model = mergeObjects(
        detail.model_config.model,
        $botDetail.model_config.model
      )
    }

    setBotDetail(cloneDeep(detail))
    if ($activeChat.detail?.model_config?.agent_mode) {
      detail.model_config.agent_mode =
        $activeChat.detail?.model_config?.agent_mode
    }
    $activeChat.detail = cloneDeep(detail)

    // if ($activeChat.hasKnowledge) {
    //   await getKnowledge()
    //   if (!$activeChat.datasets) {
    //     $activeChat.datasets = {
    //       [knowledge[0].id]: [],
    //     }
    //   }
    //   if ($activeChat.datasets) {
    //     handleChangeSelectKnowledge(Object.keys($activeChat.datasets))
    //   }
    // }
    const result = {}
    detail.model_config.user_input_form.forEach((item) => {
      const [key] = Object.keys(item)
      const {variable, default: defaultVal} = item[key]
      result[variable] = defaultVal
    })
    setActiveChat({
      ...$activeChat,
      inputs: result,
    })
  }

  const getConversationList = async () => {
    const data = await getConversations({
      limit: 9999999,
    })
    const idx = data.data.findIndex((v) => v.id === $activeChat.id)
    if (idx > -1) {
      const cur = data.data[idx]
      $activeChat.bot_id = cur.bot_id
      $activeChat.model_name = cur.model_name
      $activeChat.model_provider = cur.model_provider
      $activeChat.tools = cur.tools
      await getModelDetail()
      $activeChat.detail = $activeChat.detail || {}
      $activeChat.detail.model_config = $activeChat.detail.model_config || {}
      $activeChat.detail.model_config.agent_mode = cur.agent_mode
      setActiveChat({
        ...$activeChat,
      })
      await getBotDetail()
      // if (cur.datasets) {
      //   // eslint-disable-next-line prefer-destructuring
      //   $selectedKnowledge.id = Object.keys(cur.datasets)[0]
      //   setSelectedKnowledge((pre) => ({
      //     ...pre,
      //     id: Object.keys(cur.datasets)[0],
      //   }))
      // }
    } else {
      await getBotDetail()
    }
    setChats(data.data || [])
  }

  const handleClickExtraItem = (info) => {
    if (visibleExtra && info.id === extraInfo.id) {
      setVisibleExtra(false)
      setExtraInfo({})
      return
    }
    if (visible) {
      setVisible(false)
    }
    setExtraInfo(info)
    setVisibleExtra(true)
  }

  const createChat = async () => {
    if (urlChatId.current) return
    const data = await createConversation()
    $activeChat.id = data.id
    setActiveChat({...$activeChat})
    // needEditNameRef.current = true
    urlChatId.current = data.id
    window.history.pushState({}, null, `/bots/${spaceId}/chat/${data.id}`)
  }

  const createTempBase = async () => {
    try {
      await createTempKnowledge({
        embedding_model: '',
      })
      setShowUpload(true)
    } catch (err) {
      setShowUpload(false)
      Message.error(err.msg)
    }
  }

  useEffect(() => {
    setArtifact({
      type: '',
      content: '',
    })
    setActiveChat({})
    setBotDetail(initBotDetail())
    setCurrentModel({})
    if ($live2dModel) {
      $live2dModel.stopSpeaking()
      // $live2dModel.destroyModel()
      setLive2dModel(undefined)
    }

    if (!$activeChat.bot_id && botId) {
      $activeChat.bot_id = botId
    }
    if (!$activeChat.id && urlChatId.current) {
      $activeChat.id = urlChatId.current
    }
    getConversationList()

    createTempBase()
    return () => {
      setOpenPlan(false)
      urlChatId.current = ''
      setActiveChat({})
      setBotDetail(initBotDetail())
    }
  }, [])

  useEffect(() => {
    if (
      $activeChat?.detail?.model_config?.user_input_form?.length > 0 ||
      $activeChat?.hasKnowledge ||
      $activeChat?.detail?.category !== 'assistant'
    ) {
      setShowRight(true)
    } else {
      setShowRight(false)
    }
  }, [$activeChat])

  useEffect(() => {
    if (
      $activeChat.model_name &&
      $botDetail.model_config &&
      $botDetail.model_config.model &&
      $activeChat.model_name !== $botDetail.model_config?.model?.name
    ) {
      getModelDetail()
    }
  }, [$activeChat.model_name, $activeChat.model_provider])

  return (
    <div
      className={`bg-white flex flex-col h-full min-w-100 overflow-hidden relative bg-[url(${$botDetail?.background_img})]`}
      style={{
        background: `url(${$botDetail?.background_img}) no-repeat center / 100% 100%`,
      }}
    >
      <NavBar
        icon={$botDetail.icon}
        name={$botDetail.name}
        visible={visible}
        showEdit={!$botDetail.locked && $activeChat.bot_id}
        handleEdit={() => {
          history.push(`/space/${spaceId}/bot/${$activeChat.bot_id}`)
        }}
        setVisible={setVisible}
        showRight={showRight}
      />
      <div
        className={`${$botDetail?.background_img ? 'bg-black/20' : ''} flex flex-col flex-1 overflow-hidden`}
      >
        <div className="flex flex-1 h-full max-w-[100vw] overflow-auto">
          <div
            className={`${$openPlan || (!visible && visibleExtra) ? 'w-1/2' : 'w-5/6'} mx-auto h-full relative z-10 flex-1`}
            // className={`${(plugin_config?.live2d?.enable || visible) && $showSidebar ? 'w-[650px]' : 'basis-2/3'} transition-all mx-auto h-full relative z-10`}
          >
            <Conversation
              refresh={getConversationList}
              showUpload={showUpload}
              spaceId={spaceId}
              chatId={chatId}
              currentChatId={urlChatId.current}
              createChat={createChat}
              handleClickExtraItem={handleClickExtraItem}
              setLoading={setLoading}
              setSending={setSending}
            />
          </div>
          <RightDrawer refreshBot={getBotDetail} visible={visible} />
          {!visible && visibleExtra && !$openPlan ? (
            <ExtraModal
              type={
                extraInfo?.tool_type === 'mcp_tool' ? 'MCP Tools' : 'Knowledge'
              }
              info={extraInfo}
              onClose={() => {
                setVisibleExtra(false)
                setExtraInfo({})
              }}
            />
          ) : null}
          {$artifacts.type === 'html' || $artifacts.type === 'xml' ? (
            <HTMLArtifact />
          ) : null}
          {$artifacts.type === 'svg' ? <SvgArtifact /> : null}
          {$openPlan ? (
            <StartPlan
              visible={visible}
              visibleExtra={visibleExtra}
              extraInfo={extraInfo}
              setVisibleExtra={setVisibleExtra}
              setExtraInfo={setExtraInfo}
              loading={!loading}
              sending={sending}
              handleClickExtraItem={handleClickExtraItem}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Chat)
