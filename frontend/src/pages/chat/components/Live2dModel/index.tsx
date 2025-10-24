import {useAtom} from 'jotai'
import React, {useEffect, useState} from 'react'

import {getLive2dLIst} from '~/lib/apis/bots'
import live2d from '~/lib/model/live2d'
import {activeChat} from '~/lib/stores'
import {currentModel, live2dModel} from '~/lib/stores/chat'

function Live2dModel() {
  // const Live2d = live2d()
  const [$live2dModel, setLive2dModel] = useAtom(live2dModel)
  const [$activeChat] = useAtom(activeChat)
  const [$currentModel, setCurrentModel] = useAtom(currentModel)
  const [urlPath, setUrlPath] = useState('')
  const [list, setList] = useState([])

  const getLive2dList = async () => {
    const data = await getLive2dLIst()
    setList(data)
  }

  const getLive2dPath = () => {
    const {live2dEnable, live2dModel: model} = $currentModel

    if (!live2dEnable) {
      $live2dModel?.destroyModel()
      setUrlPath('')
      return
    }
    const canvas = document.getElementById('canvas_view')
    if (!canvas) {
      const canvasWarp = document.getElementById('canvasWrap')
      const newCanvas = document.createElement('canvas')
      newCanvas.setAttribute('id', 'canvas_view')
      newCanvas.setAttribute('width', '100%')

      newCanvas.setAttribute('height', '100%')
      // newCanvas.id = 'canvas_view'
      newCanvas.style.width = '100%'
      newCanvas.style.height = '100%'
      newCanvas.style.background = 'transparent'
      canvasWarp.appendChild(newCanvas)
    }

    const modelInfo = list.find((v) => v.name === model)
    if (modelInfo.url !== urlPath) {
      setCurrentModel((pre) => ({...pre, ...modelInfo}))
      setUrlPath(modelInfo.url)
    }
  }

  const getModelInit = () => {
    const {
      detail: {model_config: {plugin_config: pluginInfo}} = {
        model_config: {
          plugin_config: {},
        },
      },
    } = $activeChat
    $currentModel.voice = pluginInfo?.tts?.voice || ''
    $currentModel.voiceEnable = pluginInfo?.tts?.enable || false
    $currentModel.live2dEnable = pluginInfo?.live2d?.enable || false
    $currentModel.live2dModel = pluginInfo?.live2d?.model || ''
    setCurrentModel({...$currentModel})
  }

  const initModel = async () => {
    // if ($live2dModel) {
    //   $live2dModel.destroyModel()
    // }
    const model = await live2d()
    model.init()
    setLive2dModel(model)
  }

  useEffect(() => {
    initModel()
    return () => {
      $live2dModel?.stopSpeaking()
      $live2dModel?.destroyModel()
    }
  }, [])

  useEffect(() => {
    if ($activeChat.detail && $currentModel.voice === undefined) {
      getModelInit()
    }
  }, [$activeChat])

  useEffect(() => {
    if (list.length > 0 && $currentModel.live2dModel) {
      getLive2dPath()
    }
  }, [$currentModel, list])

  useEffect(() => {
    if (urlPath !== '') {
      $live2dModel?.loadModel({
        ...$currentModel,
        url: `/api/files/resources${urlPath}`,
      })
    }
  }, [urlPath])

  useEffect(() => {
    if (list.length === 0) {
      getLive2dList()
    }
  }, [list])

  return (
    <div
      id="canvasWrap"
      className="bg-transparent absolute w-[360px] h-full bottom-0 right-0"
    >
      <canvas id="canvas_view" className="bg-transparent w-full h-full" />
    </div>
  )
}

export default Live2dModel
