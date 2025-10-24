import {t} from 'i18next'
import {useAtom} from 'jotai'
import {useEffect} from 'react'

import IconEmpty from '~/assets/empty.svg'
import {getKnowledgeList} from '~/lib/apis/knowledge'
import {knowledgeList, selectKnowledge} from '~/lib/stores'

import KnowledgeDetailPanel from './KnowledgeDetailPanel'
import SidebarModelsPanel from './SidebarModelsPanel'

export default function KnowledgeRepository() {
  const [$knowledgeList, setKnowledgeList] = useAtom(knowledgeList)
  const [, setSelectKnowledge] = useAtom(selectKnowledge)

  const getList = async (add = false) => {
    const data = await getKnowledgeList()
    setKnowledgeList(data)
    if (data.collection_info.length) {
      setSelectKnowledge(
        add
          ? data.collection_info[data.collection_info.length - 1]
          : data.collection_info[0]
      )
    }
  }

  useEffect(() => {
    getList()
  }, [])

  return (
    <div className="flex">
      <SidebarModelsPanel getList={getList} />
      <div className="flex-1">
        {$knowledgeList.collection_info.length ? (
          <KnowledgeDetailPanel />
        ) : (
          <div className="flex items-center flex-col h-full justify-center">
            <img src={IconEmpty} className="w-[120px] h-[120px] mb-5" />
            <div className="mb-2 text-[#03060E] font-600 text-[20px]">
              {t('No knowledge base available')}
            </div>
            <div>
              {t(
                'The knowledge base can be added to the Bot as supplementary knowledge for the LLM.Click the button in the upper left corner to create a knowledge base'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
