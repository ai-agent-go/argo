import {Button, Message, Radio} from '@arco-design/web-react'
import {IconDelete, IconEmpty} from '@arco-design/web-react/icon'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Link, useParams} from 'react-router-dom'

import ArgoModal from '~/components/Modal'
import OverflowTooltip from '~/components/OverflowTooltip'
import {
  bindWorkspace,
  getKnowledgeList,
  unBindWorkspace,
} from '~/lib/apis/knowledge'
import IconKnowledge from '~/pages/assets/ic_knowledge.svg'
import IconTitleKnowledge from '~/pages/assets/knowledge.svg'

import ItemContainer from '../ItemContainer'

function KnowledgeItem({
  value,
  onChange,
  selectedList, // id, name
  setSelectedList,
  addKnowledgeKey,
}) {
  const {t} = useTranslation()
  const {botId, spaceId} = useParams<{botId: string; spaceId: string}>()
  // const [unselectedList, setUnSelectedList] = useState([])
  const [list, setList] = useState([])
  const [selected, setSelected] = useState<any>([]) // collection_name, knowledge_name
  const [visible, setVisible] = useState(false)

  const getList = async () => {
    try {
      const data = await getKnowledgeList()
      setList(data.collection_info)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  useEffect(() => {
    if (list.length > 0 && value) {
      const acc = []
      const valueArr: any = value?.filter(({type}) => type === 'dataset')
      // const arr = []
      list.forEach((cur) => {
        const idx = valueArr.findIndex((v) => v.id === cur.collection_name)
        if (idx === -1) {
          acc.push(cur)
        }
      })
      // setUnSelectedList(acc)
      setSelectedList(valueArr.map((v) => ({...v, collection_name: v.id})))
      setSelected(
        valueArr.map((v) => ({
          ...v,
          collection_name: v.id,
          description: v.description,
          enabled: true,
          knowledge_name: v.name,
          type: 'dataset',
        }))
      )
    }
  }, [value, list])

  useEffect(() => {
    if (visible) {
      setSelected(
        selectedList.map((v) => ({
          ...v,
          collection_name: v.id,
          description: v.description,
          enabled: true,
          knowledge_name: v.name,
          type: 'dataset',
        }))
      )
    } else {
      setSelected([])
    }
  }, [selectedList, visible])

  const handleSubmit = async () => {
    // if (!selected) {
    //   return Message.error('no dataset choose')
    // }
    const acc = selected.filter(
      (listItem) =>
        !selectedList.some(
          (selectedItem) =>
            selectedItem.collection_name === listItem.collection_name
        )
    )

    // 获取需要解绑的知识库（在旧选中列表但不在新选中列表）
    const unbindList = selectedList.filter(
      (prevItem) =>
        !selected.some(
          (currentItem) =>
            currentItem.collection_name === prevItem.collection_name
        )
    )

    try {
      const data = await Promise.all(
        acc.map(async (v) => {
          await bindWorkspace({
            bot_id: botId,
            space_id: spaceId,
            collection_name: v.collection_name,
            description: v.description,
            partition_names: v.partition_names,
            permission: v.permission,
          })
          return v
        })
      )
      const unbindData = await Promise.all(
        unbindList.map(async (v) => {
          await unBindWorkspace({
            bot_id: botId,
            space_id: spaceId,
            collection_name: v.collection_name,
          })
          return v
        })
      )
      const unBindMap = new Map(
        unbindData.map((item) => [item.collection_name, item])
      )
      const newValue = selectedList
        .concat(
          data.map((v) => ({
            id: v.collection_name,
            enabled: true,
            type: 'dataset',
            name: v.knowledge_name,
            description: v.description,
          }))
        )
        .filter((item) => !unBindMap.has(item.collection_name))
      onChange(newValue)
      setVisible(false)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return null
  }

  useEffect(() => {
    getList()
  }, [])

  useEffect(() => {
    if (addKnowledgeKey) {
      setVisible(true)
    }
  }, [addKnowledgeKey])

  const handleRemoveItem = async (val) => {
    const idx = selectedList.findIndex(
      (v) => v.collection_name === val.collection_name
    )
    if (idx > -1) {
      try {
        await unBindWorkspace({
          bot_id: botId,
          space_id: spaceId,
          collection_name: val.collection_name,
        })
        selectedList.splice(idx, 1)
        setSelectedList([...selectedList])
        // setUnSelectedList((pre) => [...pre, val])
        onChange(
          selectedList.map((v) => ({
            id: v.collection_name,
            name: v.name,
            description: v.description,
            enabled: true,
            type: 'dataset',
          }))
        )
      } catch (err) {
        Message.error(err.msg || 'Server error, try again later')
      }
    }
  }

  const renderPopover = (
    <div className="relative box-content mt-8 px-5">
      <div className="w-full max-h-[314px] overflow-y-scroll box-border flex flex-col gap-[6px]">
        {list?.map((item) => (
          <div
            key={item.collection_name}
            className="flex space-x-4 cursor-pointer w-full p-2 hover:bg-[#F2F6FF] rounded-xl"
            onClick={() => {
              const idx = selected.findIndex(
                (v) => v.collection_name === item.collection_name
              )
              if (idx > -1) {
                selected.splice(idx, 1)
                setSelected([...selected])
              } else {
                setSelected([...selected, item])
              }
            }}
          >
            <div className=" flex flex-1 space-x-3.5 cursor-pointer w-full overflow-hidden">
              <div className=" self-start w-[38px] h-[38px] pt-0.5">
                <div className="rounded-full bg-stone-700">
                  <img
                    src={IconKnowledge}
                    alt="modelfile profile"
                    className=" rounded-full w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className={` flex-1 self-center overflow-hidden`}>
                <div className=" text-[14px] font-600 overflow-hidden">
                  <OverflowTooltip>{item.knowledge_name}</OverflowTooltip>
                </div>
                <div className=" text-xs overflow-hidden">
                  <OverflowTooltip>{t(item.description)}</OverflowTooltip>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-0.5 self-center">
              <Radio
                checked={
                  selected?.findIndex(
                    (v) => v.collection_name === item.collection_name
                  ) > -1
                }
              />
            </div>
          </div>
        ))}
      </div>
      {list.length > 0 ? (
        <div className="flex items-center justify-end gap-3 my-2">
          <Button
            className="w-[79px] h-[38px] rounded-[8px] bg-[#AEAFB34D] text-[#03060E]"
            onClick={() => {
              setVisible(false)
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="w-[79px] h-[38px] rounded-[8px] bg-[#133EBF] text-[#fff]"
            onClick={handleSubmit}
            type="primary"
            disabled={!selected}
          >
            {t('Confirm')}
          </Button>
        </div>
      ) : null}
      {list.length === 0 ? (
        <div className="w-full py-20 text-center">
          <IconEmpty className="text-7xl" />
          <div className="max-h-[280px] text-center p-6">
            <div>
              {t('There is no knowledge base yet, please click to go to the ')}{' '}
              <Link
                to={`/space/${spaceId}/knowledge`}
                className="font-600 text-blue-700 cursor-pointer"
                draggable="false"
              >
                {t('knowledge base page')}
              </Link>{' '}
              {t('to configure')}.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  const renderIcon = () => <img src={IconTitleKnowledge} alt="" />

  return (
    <div>
      <ItemContainer
        icon={renderIcon}
        title={t('Knowledge')}
        onAdd={() => {
          setVisible(true)
        }}
      >
        {selectedList?.map((item) => {
          return (
            <div
              key={item.collection_name}
              className=" flex space-x-4 w-full px-3 py-2  hover:bg-black/5 rounded-xl"
            >
              <div className=" flex flex-1 space-x-2 cursor-pointer w-full">
                <div className=" self-start w-[38px] h-[38px] pt-0.5">
                  <div className="rounded-full bg-stone-700">
                    <img
                      src={IconKnowledge}
                      alt="modelfile profile"
                      className=" rounded-full w-full h-auto object-cover"
                    />
                  </div>
                </div>

                <div className={` flex-1 self-center`}>
                  <div className="  font-600 text-stone-700 line-clamp-1">
                    {item.name}
                  </div>
                  <div className=" text-xs overflow-hidden text-ellipsis line-clamp-1">
                    {item.description}
                  </div>
                </div>
                <div className="flex flex-row gap-0.5 self-center cursor-pointer ">
                  <IconDelete
                    onClick={() => {
                      handleRemoveItem(item)
                    }}
                    className="text-[#565759] text-[16px]"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </ItemContainer>
      <ArgoModal
        visible={visible}
        title={t('Choose Knowledge')}
        footer={null}
        handleClose={() => {
          setVisible(false)
        }}
      >
        {renderPopover}
      </ArgoModal>
    </div>
  )
}

export default KnowledgeItem
