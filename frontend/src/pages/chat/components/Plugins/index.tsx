import {Message, Select, Switch} from '@arco-design/web-react'
import {useAtom} from 'jotai'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {getLive2dLIst, getTTS} from '~/lib/apis/bots'
import {activeChat} from '~/lib/stores'
import {currentModel, live2dModel} from '~/lib/stores/chat'

function Plugins() {
  const {t} = useTranslation()
  const [$activeChat] = useAtom(activeChat)
  const [$currentModel, setCurrentModel] = useAtom(currentModel)
  const [$live2dModel] = useAtom(live2dModel)

  const [ttsList, setTTSList] = useState([])
  const [live2dList, setLive2dList] = useState([])

  const getLive2dList = async () => {
    const data = await getLive2dLIst()
    setLive2dList(data)
  }

  const getTTSList = async () => {
    const tts = await getTTS()
    setTTSList(tts.data)
  }

  const getModelInit = () => {
    const {
      detail: {model_config: {plugin_config: pluginInfo}} = {
        model_config: {
          plugin_config: {
            live2d: {enable: false, model: ''},
            tts: {enable: false, voice: ''},
          },
        },
      },
    } = $activeChat
    $currentModel.voice = pluginInfo?.tts?.voice || ''
    $currentModel.voiceEnable = pluginInfo?.tts?.enable || false
    $currentModel.live2dEnable = pluginInfo?.live2d?.enable || false
    $currentModel.live2dModel = pluginInfo?.live2d?.model || ''
  }

  useEffect(() => {
    getTTSList()
    getLive2dList()
  }, [])

  useEffect(() => {
    if ($currentModel.voice === undefined) {
      getModelInit()
    }
  }, [$activeChat])

  return (
    <div className="p-5">
      <div className="bg-[#F9F9F9] rounded-[8px]">
        <div className="flex items-center justify-between box-border px-4 py-[14px] border-b-[0.5px] border-solid border-[#EBEBEB]">
          <div>TTS</div>
          <Switch
            checked={$currentModel.voiceEnable}
            onChange={(v) => {
              setCurrentModel({
                ...$currentModel,
                voiceEnable: v,
              })
            }}
          />
        </div>
        <div className="py-5 px-4">
          <div className="w-full h-[32px] rounded-[6px] border-[1px] border-solid border-[#EBEBEB] bg-white">
            <Select
              bordered={false}
              placeholder={t('TTS voice selection')}
              value={$currentModel.voice}
              onChange={(v) => {
                setCurrentModel({
                  ...$currentModel,
                  voice: v,
                })
              }}
              showSearch
              options={ttsList.map((v) => ({
                label: v.ShortName,
                value: v.ShortName,
              }))}
            />
          </div>
        </div>
      </div>
      <div className="bg-[#F9F9F9] rounded-[8px] mt-4">
        <div className="flex items-center justify-between box-border px-4 py-[14px] border-b-[0.5px] border-solid border-[#EBEBEB]">
          <div>Live2d</div>
          <Switch
            checked={$currentModel.live2dEnable}
            onChange={(v) => {
              const model = $live2dModel.checkModelLoaded()
              if (!v && !model) {
                Message.error(
                  t(
                    'The loading of live2d is not yet complete. Please try again later'
                  )
                )
                return
              }
              if (v) {
                setCurrentModel({
                  ...$currentModel,
                  live2dEnable: v,
                  live2dModel:
                    $currentModel.live2dModel || live2dList?.[0]?.name,
                })
              } else {
                setCurrentModel({
                  ...$currentModel,
                  live2dEnable: v,
                })
              }
            }}
          />
        </div>
        <div className="py-5 px-4">
          <div className="w-full h-[32px] rounded-[6px] border-[1px] border-solid border-[#EBEBEB] bg-white">
            <Select
              bordered={false}
              placeholder={t('Live2d character selection')}
              value={$currentModel.live2dModel}
              showSearch
              onChange={(v) => {
                setCurrentModel({
                  ...$currentModel,
                  live2dModel: v,
                })
              }}
            >
              {live2dList.map((item) => (
                <Select.Option key={item.name} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Plugins
