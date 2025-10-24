import {useAtom} from 'jotai'

import {knowledgeList, selectKnowledge} from '~/lib/stores'

export function useKnowledgeListActions() {
  const [$knowledgeList, setKnowledgeList] = useAtom(knowledgeList)
  const [, setSelectKnowledge] = useAtom(selectKnowledge)
  // 更新
  const updateKnowledgeList = (listItem) => {
    const updatedKnowledgeList = $knowledgeList.collection_info.map((item) => {
      if (listItem.collection_name === item.collection_name) {
        return listItem
      }
      return item
    })

    setKnowledgeList({
      collection_info: updatedKnowledgeList,
    })
  }

  // 删除
  const deleteKnowledgeFromList = (listItem) => {
    const filteredModelList = $knowledgeList.collection_info.filter((item) => {
      if (listItem.collection_name !== item.collection_name) {
        return true
      }
      return false
    })

    setKnowledgeList({
      collection_info: filteredModelList,
    })
    setSelectKnowledge(filteredModelList[0] ? filteredModelList[0] : null)
  }

  return {
    updateKnowledgeList,
    deleteKnowledgeFromList,
  }
}
