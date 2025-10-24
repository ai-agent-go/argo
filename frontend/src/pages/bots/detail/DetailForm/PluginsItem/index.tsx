import {Select, Switch} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import ToolboxIcon from '~/components/icons/ToolboxIcon'
import {getLive2dLIst, getTTS} from '~/lib/apis/bots'

import ItemContainer from '../ItemContainer'

function PluginsItem({value, onChange}) {
  const {t} = useTranslation()
  const [pluginInfo, setPluginInfo] = useState({
    live2d: {
      enable: false,
      model: '',
    },
    tts: {
      enable: false,
      voice: '',
    },
  })
  const [live2dList, setLive2dList] = useState([])
  const [ttsList, setTTSList] = useState([])

  const handleChange = () => {
    setPluginInfo({...pluginInfo})
    onChange({...value, plugin_config: pluginInfo})
  }

  const getLive2dList = async () => {
    const data = await getLive2dLIst()
    setLive2dList(data)
  }

  const getTTSList = async () => {
    const tts = await getTTS()
    setTTSList(tts.data)
  }

  useEffect(() => {
    getLive2dList()
    getTTSList()
  }, [])

  useEffect(() => {
    setPluginInfo({
      live2d: {
        enable: false,
        model: '',
      },
      tts: {
        enable: false,
        voice: '',
      },
      ...value?.plugin_config,
    })
  }, [value])

  return (
    <div>
      <ItemContainer icon={() => ToolboxIcon({})} title={t('Plugins')}>
        <div className="w-full overflow-x-scroll">
          <div className="flex flex-1 items-center space-x-3.5 w-full px-[16px] ">
            <div className="flex-1 self-center flex items-center">
              <div className="font-bold line-clamp-1 text-[#03060E] text-[12px] leading-[18px] w-11 mr-[14px]">
                TTS
              </div>
              <div className="w-[120px] h-[32px] rounded-[6px] border-[1px] border-solid border-[#EBEBEB] bg-white">
                <Select
                  bordered={false}
                  placeholder={t('TTS voice selection')}
                  value={pluginInfo?.tts?.voice}
                  onChange={(v) => {
                    pluginInfo.tts.voice = v
                    handleChange()
                  }}
                  showSearch
                  options={ttsList.map((v) => ({
                    label: v.ShortName,
                    value: v.ShortName,
                  }))}
                />
              </div>
            </div>
            <div className="flex flex-row gap-0.5 self-center cursor-pointer ">
              <Switch
                checked={pluginInfo?.tts?.enable}
                onChange={(v) => {
                  if (v) {
                    pluginInfo.tts.voice =
                      pluginInfo?.tts?.voice || 'zh-CN-XiaoyiNeural'
                  }
                  pluginInfo.tts.enable = v
                  handleChange()
                }}
              />
            </div>
          </div>
          <div className="flex flex-1 items-center space-x-3.5 w-full px-[16px] mt-4">
            <div className="flex-1 self-center flex items-center">
              <div className="font-bold line-clamp-1 text-[#03060E] text-[12px] leading-[18px] w-11 mr-[14px]">
                Live2d
              </div>
              <div className="w-[120px] h-[32px] rounded-[6px] border-[1px] border-solid border-[#EBEBEB] bg-white">
                <Select
                  bordered={false}
                  placeholder={t('Live2d character selection')}
                  value={pluginInfo?.live2d?.model}
                  showSearch
                  onChange={(v) => {
                    pluginInfo.live2d.model = v
                    handleChange()
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
            <div className="flex flex-row gap-0.5 self-center cursor-pointer ">
              <Switch
                checked={pluginInfo?.live2d?.enable}
                onChange={(v) => {
                  if (v) {
                    pluginInfo.live2d.model =
                      pluginInfo?.live2d?.model || live2dList?.[0]?.name
                  }
                  pluginInfo.live2d.enable = v
                  handleChange()
                }}
              />
            </div>
          </div>
        </div>
        <div />
      </ItemContainer>
    </div>
  )
}

export default PluginsItem
