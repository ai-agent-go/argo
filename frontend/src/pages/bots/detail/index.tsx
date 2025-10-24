import {Message, Popover} from '@arco-design/web-react'
import {IconEdit} from '@arco-design/web-react/icon'
import {useAtom} from 'jotai'
import cloneDeep from 'lodash/cloneDeep'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Prompt, useHistory, useParams} from 'react-router-dom'

import BackIcon from '~/components/icons/BackIcon'
import SidebarIcon from '~/components/SidebarIcon'
import {getBotConfig, updateBot} from '~/lib/apis/bots'
import {createTempKnowledge} from '~/lib/apis/knowledge'
import {getModelList} from '~/lib/apis/models'
import {openPlan} from '~/lib/stores'
import {isInArgo} from '~/utils'

import ModifyModal from '../components/ModifyModal'
import BotDetailChat from './Chat'
import ConfigHeader from './ConfigHeader'
import DetailForm from './DetailForm'

function BotDetail() {
  const {t} = useTranslation()
  const history = useHistory()
  const {botId, spaceId} = useParams<{spaceId: string; botId: string}>()
  const preDetailInfo = useRef()
  const [detail, setDetail] = useState({
    icon: '',
    name: '',
    category: '',
    description: '',
    background_img: '',
    inputs: undefined,
    model_config: {agent_mode: {tools: []}, prologue: ''},
  })
  const modifyModalRef = useRef(null)
  const [models, setModels] = useState([])
  const [isSave, setIsSave] = useState(false)
  const [checkCanQuit, setCheckCanQuit] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [$openPlan] = useAtom(openPlan)

  const getBotDetail = async () => {
    const data = await getBotConfig(botId)
    let inputs = {}
    if (detail.inputs) {
      inputs = detail.inputs
    } else {
      data?.model_config?.user_input_form?.forEach((v) => {
        const {variable, default: defaultValue}: any = Object.values(v)[0]
        inputs[variable] = defaultValue
      })
    }

    setDetail({...data, inputs})
    preDetailInfo.current = cloneDeep({
      ...data,
      inputs,
    })
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

  const getModels = async () => {
    try {
      const data = await getModelList({
        download_status: 'all_complete',
        is_generation: true,
      })
      setModels(data?.model_list || [])
      // setModels(
      //   (data?.model_list || []).filter(
      //     (item) => item.download_status === 'all_complete'
      //   )
      // )
      createTempBase()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const handleUpdateBot = async (val) => {
    try {
      await updateBot({
        ...val,
        id: botId,
        space_id: spaceId,
      })
      Message.success('update success')
      getBotDetail()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const checkIsNotSaveForm = () => {
    setCheckCanQuit(
      JSON.stringify(preDetailInfo.current) === JSON.stringify(detail)
    )
  }

  useEffect(() => {
    checkIsNotSaveForm()
  }, [detail])

  useEffect(() => {
    getBotDetail()
    getModels()
  }, [])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-center px-5 h-[60px] box-border border-b border-slate-200 ">
        <SidebarIcon />
        <button
          className="p-1 w-6"
          onClick={() => {
            if (
              (!isInArgo() && history.length > 1) ||
              (isInArgo() && history.length > 2)
            ) {
              // history.goBack()
              window.history.back()
            } else {
              history.push(`/bots/${spaceId}`)
            }
          }}
          aria-label="back"
        >
          <BackIcon />
        </button>
        <div className="h-8 ml-6 mr-2.5 relative w-8 rounded-lg overflow-hidden">
          <img src={detail.icon} alt="" className="w-full h-full" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center mb-1">
            <Popover content={detail.name} style={{marginLeft: '-40px'}}>
              <h1 className="font-500 text-14 truncate text-ellipsis overflow-hidden text-nowrap">
                {detail.name}
              </h1>
            </Popover>

            <div
              className="ml-1"
              onClick={() => {
                modifyModalRef.current?.openModifyModal()
              }}
            >
              <IconEdit />
            </div>
          </div>
          <Popover content={detail.description} style={{marginLeft: '-40px'}}>
            <div
              className="text-ellipsis overflow-hidden text-nowrap text-[10px] text-gray-700 max-w-52"
              aria-describedby="tippy-10"
            >
              {detail.description}
            </div>
          </Popover>
        </div>
        <div className="ml-auto">
          <ConfigHeader
            detail={detail}
            changeDetail={setDetail}
            modelList={models}
          />
        </div>
      </div>
      <div className="flex flex-col w-full flex-1 overflow-hidden">
        <div className="flex flex-1 flex-row w-full overflow-hidden">
          {!$openPlan ? (
            <DetailForm
              detail={detail}
              changeDetail={setDetail}
              modelList={models}
              handleSaveInfo={async (v) => {
                preDetailInfo.current = cloneDeep(v)
                await getBotDetail()
                setIsSave(true)
                checkIsNotSaveForm()
                setTimeout(() => {
                  setIsSave(false)
                }, 600)
              }}
            />
          ) : null}
          <BotDetailChat
            detail={detail}
            isSave={isSave}
            modelList={models}
            changeDetail={setDetail}
            refresh={() => {
              getBotDetail()
              getModels()
            }}
            spaceId={spaceId}
            showUpload={showUpload}
          />
        </div>
      </div>
      <ModifyModal
        ref={modifyModalRef}
        info={detail}
        handleSubmit={handleUpdateBot}
      />
      <Prompt
        when={!checkCanQuit}
        message={t(
          'The current modifications have not been saved. Are you sure you want to leave?'
        )}
      />
    </div>
  )
}

export default React.memo(BotDetail)
