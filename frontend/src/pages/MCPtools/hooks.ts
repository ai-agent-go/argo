import {useAtom} from 'jotai'

import {MCPToolsList} from '~/lib/stores'

export function useMCPToolsListActions() {
  const [$MCPToolsList, setMCPToolsList] = useAtom(MCPToolsList)
  // 更新
  const updateToolsList = (listItem) => {
    const updatedToolsList = $MCPToolsList.server_list.map((item) => {
      if (listItem.id === item.id) {
        return listItem
      }
      return item
    })

    setMCPToolsList({
      server_list: updatedToolsList,
    })
  }

  // 删除
  const deleteToolFromList = (listItem) => {
    const filteredModelList = $MCPToolsList.server_list.filter((item) => {
      if (listItem.id !== item.id) {
        return true
      }
      return false
    })

    setMCPToolsList({
      server_list: filteredModelList,
    })
  }

  // 添加
  const addToolToList = (listItem) => {
    setMCPToolsList({
      server_list: [...$MCPToolsList.server_list, listItem],
    })
  }

  return {
    updateToolsList,
    deleteToolFromList,
    addToolToList,
  }
}
