import {Message} from '@arco-design/web-react'
import {t} from 'i18next'
import {useAtom, useAtomValue} from 'jotai'
import {useEffect, useRef, useState} from 'react'
import {Prompt} from 'react-router-dom'

import {deleteModelProviders, getModelProviders} from '~/lib/apis/settings'
import {currentWorkspace, modelList, selectModelProvider} from '~/lib/stores'

import SidebarModelsPanel from './components/SidebarModelsPanel'
import {useModelListActions} from './hooks'
import LocalModel from './localModel'
import SupplierModel from './supplierModel'

function Models() {
  const {deleteModelFromList} = useModelListActions()
  const $currentWorkspace = useAtomValue(currentWorkspace)
  const [, setModelList] = useAtom(modelList)
  const [$selectModelProvider, setSelectModelProvider] =
    useAtom(selectModelProvider)
  const [LLMConnectError, setLLMConnectError] = useState('')
  const [ollamaModel, setOllamaModel] = useState({
    credentials: {
      base_url: '',
    },
  })
  const sideListRef = useRef(null)

  const [editing, setEditing] = useState(false) // 记录编辑后是否检查

  const getProviderIndex = (provider, order) => {
    // 完全匹配 siliconflow、openai、anthropic
    if (order.includes(provider)) return order.indexOf(provider)
    if (provider.includes('openai-api-compatible')) return 100
    return -1
  }

  const updateSelect = (list) => {
    const urlParams = new URLSearchParams(window.location.search)
    const customNameCurrent =
      urlParams.get('customName') ||
      $selectModelProvider.credentials.custom_name
    const providerCurrent =
      urlParams.get('provider') || $selectModelProvider.provider
    const select = list.find((item) => {
      if (providerCurrent?.includes('openai-api-compatible')) {
        return item.credentials.custom_name === customNameCurrent
      }
      return item.provider === providerCurrent
    })
    setSelectModelProvider(select || $selectModelProvider)
  }

  const getModelProvider = async () => {
    const data = await getModelProviders($currentWorkspace.id)
    const addDataFilter = data.model_list.filter(
      (item: {provider: string}) => item.provider !== 'ollama'
    )
    const ollamaArr = data.model_list.filter(
      (item: {provider: string}) => item.provider === 'ollama'
    )
    setOllamaModel(ollamaArr[0])
    data.model_list = addDataFilter
    setModelList(data)
    updateSelect(data.model_list)
  }

  const deleteProvider = async () => {
    try {
      await deleteModelProviders($currentWorkspace.id, {
        provider: $selectModelProvider.provider,
      })
      Message.success(t('Delete Success'))
      deleteModelFromList($selectModelProvider)
      setSelectModelProvider({
        provider: 'ollama',
        custom_name: '',
        label: '',
        credentials: {
          api_key: '',
          base_url: '',
          custom_chat_models: [],
          support_chat_models: [],
          support_embedding_models: [],
          custom_embedding_models: [],
          icon_url: '',
          link_url: '',
          custom_name: '',
          enable: null,
          origin_url: '',
        },
      })
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  useEffect(() => {
    getModelProvider()
  }, [])

  const handleAddProvider = async () => {
    await getModelProvider()
    requestAnimationFrame(() => {
      sideListRef.current.scrollTop = sideListRef.current.scrollHeight
    })
  }

  return (
    <div className="flex">
      <div>
        <SidebarModelsPanel
          LLMConnectError={LLMConnectError}
          editing={editing}
          setEditing={setEditing}
          handleAddProvider={handleAddProvider}
          sideListRef={sideListRef}
        />
      </div>
      {$selectModelProvider.provider === 'ollama' ? (
        <LocalModel
          LLMConnectError={LLMConnectError}
          setLLMConnectError={setLLMConnectError}
          setEditing={setEditing}
          ollamaModel={ollamaModel}
          setOllamaModel={setOllamaModel}
        />
      ) : (
        <SupplierModel
          deleteProvider={deleteProvider}
          getModelProvider={getModelProvider}
          setEditing={setEditing}
        />
      )}

      <Prompt
        when={editing}
        message={t(
          'The current modifications have not been saved. Are you sure you want to leave?'
        )}
      />
    </div>
  )
}

export default Models
