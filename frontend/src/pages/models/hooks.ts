import {useAtom} from 'jotai'

import {modelList} from '~/lib/stores'

export function useModelListActions() {
  const [$modelList, setModelList] = useAtom(modelList)

  const updateModelList = (listItem) => {
    const updatedModelList = $modelList.model_list.map((item) => {
      if (
        listItem.provider?.includes('openai-api-compatible')
          ? item.credentials.custom_name === listItem.credentials.custom_name
          : item.provider === listItem.provider
      ) {
        return listItem
      }
      return item
    })

    setModelList({
      model_list: updatedModelList,
    })
  }

  // 删除模型
  const deleteModelFromList = (listItem) => {
    const filteredModelList = $modelList.model_list.filter((item) => {
      if (
        listItem.provider?.includes('openai-api-compatible')
          ? item.credentials.custom_name !== listItem.credentials.custom_name
          : item.provider !== listItem.provider
      ) {
        return true
      }
      return false
    })

    setModelList({
      model_list: filteredModelList,
    })
  }

  // 添加模型
  const addModelToList = (listItem) => {
    setModelList({
      model_list: [...$modelList.model_list, listItem],
    })
  }

  // 返回操作函数
  return {
    updateModelList,
    deleteModelFromList,
    addModelToList,
  }
}
