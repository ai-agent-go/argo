import {Message, Tooltip} from '@arco-design/web-react'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import {useState} from 'react'

import SidebarClose from '~/components/icons/SidebarClose'
import {knowledgeList, selectKnowledge} from '~/lib/stores'
import AddImage from '~/pages/models/images/addImage'

import KnowledgeBaseModal from '../KnowledgeBaseModal'

function SidebarModelsPanel({getList}) {
  const [showSlider, setShowSidebar] = useState(true)
  const [$knowledgeList] = useAtom(knowledgeList)
  const [visible, setVisible] = useState(false)
  const [$selectKnowledge, setSelectKnowledge] = useAtom(selectKnowledge)

  const handleCreate = async () => {
    try {
      getList(true)
      setVisible(false)
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const modelItem = (item) => {
    return (
      <div
        className={`py-3 px-[10px] leading-5 rounded-md hover:bg-[#EBEBEB] cursor-pointer ${$selectKnowledge.collection_name === item.collection_name ? 'bg-[#EBEBEB]' : ''}`}
        key={item.collection_name}
        onClick={() => {
          setSelectKnowledge(item)
        }}
      >
        <div className="flex justify-between items-center">
          <Tooltip
            content={!showSlider ? `${item.knowledge_name}` : ''}
            trigger="hover"
            position="rt"
          >
            <div className="text-[#03060E] ml-1 max-w-[206px] overflow-hidden text-ellipsis whitespace-nowrap ">
              {item.knowledge_name}
            </div>
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`bg-[#F9F9F9] flex flex-col h-[100vh] overflow-hidden ${showSlider ? 'w-[250px]' : 'w-[74px]'} transition-all duration-150`}
      >
        <div
          onClick={() => {
            localStorage.setItem('botMenuVisible', !showSlider ? '1' : '')
            setShowSidebar((pre) => !pre)
          }}
          className={`cursor-pointer w-6 h-6 my-7 ${showSlider ? 'ml-7 ' : 'mx-auto'}`}
        >
          <SidebarClose />
        </div>

        <div className={`${showSlider ? 'px-4' : 'px-[15px]'}`}>
          {showSlider ? (
            <div
              className="mb-5 text-[#03060E] h-10 leading-10 rounded-md border border-[#03060E] cursor-pointer text-center mt-[10px]"
              onClick={() => {
                setVisible(true)
              }}
            >
              {t('Create Knowledge')}
            </div>
          ) : (
            <Tooltip
              content={t('Create Knowledge')}
              trigger="hover"
              position="rt"
            >
              <div className="rounded-lg cursor-pointer">
                <div className="w-6 rounded-md overflow-hidden p-[7px] border border-[#03060E] h-6 flex items-center my-[10px] mx-auto">
                  <AddImage />
                </div>
              </div>
            </Tooltip>
          )}
          <div className="h-[calc(100vh-240px)] overflow-auto">
            {$knowledgeList.collection_info.map(modelItem)}
          </div>
        </div>
      </div>
      <KnowledgeBaseModal
        onSubmit={handleCreate}
        visible={visible}
        setVisible={setVisible}
        modalType="create"
      />
    </>
  )
}

export default SidebarModelsPanel
