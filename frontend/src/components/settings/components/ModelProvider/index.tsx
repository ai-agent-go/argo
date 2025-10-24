import {useAtomValue} from 'jotai'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {getModelProviders} from '~/lib/apis/settings'
import {currentWorkspace} from '~/lib/stores'

import ModelCard from './ModelCard'
import ModelItem from './ModelItem'

function ModelProvider() {
  const {t} = useTranslation()
  const $currentWorkspace = useAtomValue(currentWorkspace)

  const [modelList, setModelList] = useState({
    model_list: [],
    not_added_list: [],
  })

  const getModelProvider = async () => {
    const data = await getModelProviders($currentWorkspace.id)
    setModelList(data)
  }

  useEffect(() => {
    getModelProvider()
  }, [])

  return (
    <div className="flex-1 overflow-hidden mx-6 my-[10px] border-[1px] border-[#EBEBEB] rounded-[8px] flex flex-col">
      <div className="basis-1/2 flex flex-col gap-1 p-4 border-b-[1px] border-[#EBEBEB] overflow-y-scroll">
        <div className="text-[#03060E] text-[14px] font-500  mb-[8px]">
          {t('Model List')}
        </div>
        {modelList.model_list.map((item) => (
          <ModelItem
            provider={item.provider}
            credentials={item.credentials}
            key={item.provider || item.custom_name}
            refresh={getModelProvider}
          />
        ))}
      </div>
      <div className="basis-1/2 p-4 overflow-y-scroll">
        <div className="text-[#03060E] text-[14px] font-500  mb-[8px]">
          {t('Add more model suppliers')}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {modelList.not_added_list.map((item) => (
            <ModelCard
              provider={item.provider}
              credentials={item.credentials}
              key={item.provider}
              refresh={getModelProvider}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModelProvider
