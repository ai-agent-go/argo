import {Message, Modal, Popover, Select} from '@arco-design/web-react'
import {IconPlus} from '@arco-design/web-react/icon'
import dayjs from 'dayjs'
import {useAtom} from 'jotai'
import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import FileIcons from '~/components/icons/FileIcons'
import GarbageBin from '~/components/icons/GarbageBin'
import KnowledgeSelectIcon from '~/components/icons/KnowledgeSelectIcon'
import MoreIcon from '~/components/icons/MoreIcon'
import {deleteDocument} from '~/lib/apis/documents'
import {getKnowledgeDetailInfo} from '~/lib/apis/knowledge'
import {activeChat} from '~/lib/stores'
import {botDetail, selectedKnowledge} from '~/lib/stores/chat'

import AddDoc from '../AddDoc'
import AddText from '../AddText'
import s from './index.module.less'

function Knowledge({refreshBot}) {
  const {t} = useTranslation()
  const btnRef = useRef(null)
  const [$activeChat, setActiveChat] = useAtom(activeChat)
  const [$botDetail, setBotDetail] = useAtom(botDetail)
  const [knowledgeList, setKnowledgeList] = useState([])
  const [selectedList, setSelectedList] = useState([])
  const [$selectedKnowledge, setSelectedKnowledge] =
    useAtom<any>(selectedKnowledge)

  // const {id: collection_name} = $selectedKnowledge

  // const [selectedList, setSelectedList] = useState([])

  const [uploadVisible, setUploadVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const handleClickItem = (item) => {
    const {tools} = $botDetail.model_config.agent_mode
    const idx = selectedList.findIndex(
      (v) => v.partition_name === item.partition_name
    )
    if (idx > -1) {
      selectedList[idx] = {
        ...item,
        enabled: !item.enabled,
      }

      setSelectedList([...selectedList])
    }
    const enabledToolIdx = tools.findIndex(
      (v) => v.type === 'dataset' && v.id === $selectedKnowledge.id
    )
    if (enabledToolIdx > -1) {
      tools[enabledToolIdx].doc_ids = selectedList
        .filter((v) => v.enabled)
        .map((v) => v.partition_name)

      $botDetail.model_config.agent_mode.tools = tools
      setActiveChat({...$activeChat})
      setBotDetail({...$botDetail})
    }
  }

  const handleChangeSelectKnowledge = (val) => {
    const idx = $botDetail.model_config.agent_mode.tools.findIndex(
      (v) => v.id === val
    )
    // const toolsIdx = $activeChat.detail.model_config.agent_mode.tools.findIndex(
    //   (v) => v.id === val
    // )

    if (idx > -1) {
      setSelectedKnowledge($botDetail.model_config.agent_mode.tools[idx])
    }
    // if (toolsIdx > -1) {
    //   $activeChat.detail.model_config.agent_mode.tools[toolsIdx].enable =
    //     $activeChat.detail.model_config.agent_mode.tools.map((v) => ({
    //       ...v,
    //       enabled: v.id === val,
    //     }))
    // }
  }

  const getDetailValues = async () => {
    try {
      const data = await getKnowledgeDetailInfo({
        collection_name: $selectedKnowledge.id,
      })
      const selectedDataset = $selectedKnowledge.doc_ids || []
      const list = data.partition_info
        .sort((a, b) => b.create_at - a.create_at)
        .filter((v) => v.document_status !== 4)
        .map((item) => {
          if (
            selectedDataset &&
            selectedDataset.findIndex((v) => v === item.partition_name) > -1
          ) {
            return {
              ...item,
              enabled: true,
            }
          }
          return {
            ...item,
            enabled: false,
          }
        })

      setSelectedList(list)
      return data
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return {}
  }

  useEffect(() => {
    if ($selectedKnowledge.id) {
      getDetailValues()
    }
  }, [$selectedKnowledge.id])

  const refreshKnowledge = () => {
    refreshBot()
    getDetailValues()
  }

  useEffect(() => {
    if (knowledgeList.length > 0 && !$selectedKnowledge.id) {
      setSelectedKnowledge({...knowledgeList[0]})
    }
  }, [knowledgeList])

  useEffect(() => {
    if ($botDetail?.model_config?.agent_mode?.tools) {
      setKnowledgeList(
        $botDetail?.model_config?.agent_mode?.tools.filter(
          (v) => v.type === 'dataset'
        ) || []
      )
    }
  }, [$botDetail])

  useEffect(() => {
    return () => {
      setSelectedKnowledge({id: ''})
    }
  }, [])

  // useEffect(() => {
  //   const {tools} = $activeChat.detail.model_config.agent_mode
  //   const enabledToolIdx = tools.findIndex(
  //     (v) => v.enabled && v.type === 'dataset'
  //   )
  //   if (enabledToolIdx > -1) {
  //     tools[enabledToolIdx].doc_ids = selectedList
  //       .filter((v) => v.enabled)
  //       .map((v) => v.partition_name)

  //     $botDetail.model_config.agent_mode.tools = tools
  //     setActiveChat({...$activeChat})
  //     setBotDetail({...$botDetail})
  //   }
  // }, [selectedList])

  const deleteModelHandler = async (v) => {
    try {
      await deleteDocument({
        collection_name: $selectedKnowledge.id,
        partition_name: v.partition_name,
      })
      Message.success(t('Delete Success'))
      getDetailValues()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const showDeleteConfirm = (item) => {
    Modal.confirm({
      title: t('Confirm your action'),
      content: t('This action cannot be undone. Do you wish to continue?'),
      onOk: () => {
        deleteModelHandler(item)
      },
    })
  }

  const popoverContent = (
    <div className="flex flex-col h-full overflow-scroll">
      <div className="flex flex-col">
        <div
          className={s.quickItem}
          onClick={() => {
            setTextVisible(true)
          }}
        >
          <span role="img" className="anticon index_icon__UBSH8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
              className=""
            >
              <path d="M213.33 810.66h60.8L691.2 393.6l-60.8-60.8-417.07 417.06v60.8ZM128 896V714.66l563.2-562.13c8.53-7.82 17.96-13.87 28.27-18.13 10.31-4.27 21.16-6.4 32.53-6.4s22.4 2.13 33.06 6.4c10.67 4.27 19.91 10.67 27.74 19.2l58.66 59.73c8.53 7.82 14.76 17.07 18.67 27.73 3.91 10.67 5.87 21.33 5.87 32 0 11.38-1.96 22.22-5.87 32.53-3.91 10.31-10.13 19.73-18.67 28.27L309.33 896zm682.66-622.93-59.73-59.73 59.73 59.73m-150.4 90.67-29.86-30.93 60.8 60.8-30.94-29.87Z" />
            </svg>
          </span>
          <div className={s.name}>Text</div>
        </div>
        <div className={s.divider} />
      </div>
      <div className="flex flex-col">
        <div className={s.quickItem} onClick={() => setUploadVisible(true)}>
          <span role="img" className="anticon index_icon__UBSH8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
              className=""
            >
              <path
                fillRule="evenodd"
                d="M852.8 494.4V480c0-105.6-37.33-195.73-112-270.4-74.67-74.67-164.8-112-270.4-112H283.2c-22.09 0-40.94 7.81-56.56 23.44-15.62 15.62-23.44 34.48-23.44 56.56V840c0 22.08 7.81 40.94 23.44 56.56C242.26 912.18 261.12 920 283.2 920h489.6c22.09 0 40.94-7.81 56.56-23.44 15.62-15.62 23.44-34.48 23.44-56.56zm-73.6 100.8V840c0 4.27-2.13 6.4-6.4 6.4H283.2c-4.27 0-6.4-2.13-6.4-6.4V177.6c0-4.27 2.13-6.4 6.4-6.4h172.88c25.59.02 47.44 9.08 65.54 27.18 18.12 18.12 27.18 39.99 27.18 65.62v57.6c0 22.09 7.81 40.95 23.43 56.57 15.62 15.62 34.48 23.43 56.57 23.43h57.6c25.63 0 47.5 9.06 65.62 27.18 18.12 18.12 27.18 39.99 27.18 65.62v100.8ZM611.98 204.58c6.95 18.37 10.42 38.18 10.42 59.42v57.6c0 4.27 2.13 6.4 6.4 6.4h57.6c21.25 0 41.05 3.47 59.42 10.42-14.38-27.52-33.4-53.11-57.07-76.77-23.67-23.67-49.26-42.69-76.77-57.07ZM384 596.8h272c2.42 0 4.81-.24 7.18-.71s4.67-1.17 6.9-2.09 4.35-2.06 6.36-3.4c2.01-1.34 3.87-2.87 5.58-4.58s3.23-3.57 4.58-5.58a36.655 36.655 0 0 0 5.49-13.26c.47-2.37.71-4.76.71-7.18s-.24-4.81-.71-7.18-1.17-4.67-2.09-6.9c-.92-2.23-2.06-4.35-3.4-6.36-1.34-2.01-2.87-3.87-4.58-5.58s-3.57-3.23-5.58-4.58a36.655 36.655 0 0 0-13.26-5.49c-2.37-.47-4.76-.71-7.18-.71H384c-2.42 0-4.81.24-7.18.71s-4.67 1.17-6.9 2.09c-2.23.92-4.35 2.06-6.36 3.4-2.01 1.34-3.87 2.87-5.58 4.58s-3.23 3.57-4.58 5.58a36.655 36.655 0 0 0-5.49 13.26c-.47 2.37-.71 4.76-.71 7.18s.24 4.81.71 7.18 1.17 4.67 2.09 6.9c.92 2.23 2.06 4.35 3.4 6.36 1.34 2.01 2.87 3.87 4.58 5.58s3.57 3.23 5.58 4.58a36.655 36.655 0 0 0 13.26 5.49c2.37.47 4.76.71 7.18.71Zm72 156.81h72c2.42 0 4.81-.24 7.18-.71s4.67-1.17 6.9-2.09c2.23-.92 4.35-2.06 6.36-3.4 2.01-1.34 3.87-2.87 5.58-4.58s3.23-3.57 4.58-5.58a36.655 36.655 0 0 0 5.49-13.26c.47-2.37.71-4.76.71-7.18s-.24-4.81-.71-7.18-1.17-4.67-2.09-6.9c-.92-2.23-2.06-4.35-3.4-6.36a36.557 36.557 0 0 0-4.58-5.58 37.158 37.158 0 0 0-5.58-4.58 36.655 36.655 0 0 0-6.36-3.4c-2.23-.93-4.53-1.62-6.9-2.09-2.37-.47-4.76-.71-7.18-.71H384c-2.42 0-4.81.24-7.18.71s-4.67 1.17-6.9 2.09c-2.23.92-4.35 2.06-6.36 3.4a36.557 36.557 0 0 0-5.58 4.58 37.158 37.158 0 0 0-4.58 5.58 36.655 36.655 0 0 0-5.49 13.26c-.47 2.37-.71 4.76-.71 7.18s.24 4.81.71 7.18 1.17 4.67 2.09 6.9 2.06 4.35 3.4 6.36c1.34 2.01 2.87 3.87 4.58 5.58s3.57 3.23 5.58 4.58a36.655 36.655 0 0 0 13.26 5.49c2.37.47 4.76.71 7.18.71h72"
              />
            </svg>
          </span>
          <div className={s.name}>Doc</div>
        </div>
      </div>
    </div>
  )

  const renderImgIcon = (item) => {
    return <FileIcons type={item.file_type} />
  }

  return (
    <div className="flex flex-col h-full p-5">
      {knowledgeList.length > 0 ? (
        <div className="mr-1 h-8 flex gap-1 items-center border-[0.5px] rounded-lg pl-2.5">
          <KnowledgeSelectIcon />
          <Select
            bordered={false}
            value={$selectedKnowledge?.name || knowledgeList[0].name}
            placeholder={t('Select Knowledge')}
            // className="w-[120px]"
            onChange={handleChangeSelectKnowledge}
          >
            {knowledgeList.map((option) => (
              <Select.Option
                key={option.id}
                value={option.id}
                style={{fontWeight: 400, fontSize: '12px'}}
              >
                {option.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      ) : null}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="flex-1 h-full mt-5 overflow-scroll no-scrollbar">
          <div className="grid grid-cols-1 gap-5 gap-y-6 t-5 pb-40">
            {selectedList.map((item) => (
              <div
                className="flex flex-col gap-1 mb-6"
                key={item.partition_name}
                onClick={(e) => {
                  e.preventDefault()
                  handleClickItem(item)
                }}
              >
                <div className="text-xs leading-5 text-[#AEAFB3] mb-2">
                  {dayjs.unix(item.create_at).format('YYYY-MM-DD HH:mm')}
                </div>
                <div
                  className={`${s.container} ${item.enabled ? `${s.selected} ` : ''} group`}
                >
                  <Popover
                    trigger="click"
                    position="bottom"
                    content={
                      <div className={s.popoverContentContainer}>
                        <div
                          className={s.itemContainer}
                          onClick={() => {
                            showDeleteConfirm(item)
                          }}
                        >
                          <span role="img" className="anticon">
                            <GarbageBin />
                          </span>
                          <span>Delete</span>
                        </div>
                      </div>
                    }
                    triggerProps={{
                      onClick: (e) => e.stopPropagation(),
                    }}
                  >
                    <span
                      role="img"
                      className="anticon w-6 h-6 p-[3px] text-primary-black text-base absolute right-[16px] top-[16px] transition-all duration-200 z-10 "
                    >
                      <MoreIcon className="text-[#AEAFB3]" />
                    </span>
                  </Popover>
                  <div className="flex font-14 break-words font-500 font-[#0f0643]">
                    {item.description}
                  </div>
                  <div className={s.fileAttachment}>
                    {renderImgIcon(item)}
                    <div className="flex flex-col flex-1 ml-[10px] overflow-hidden">
                      <div className="text-[14px] font-500 leading-6 text-[#03060E] line-clamp-1 w-full">
                        {item.document_name}
                      </div>
                      <div className="text-[10px] leading-5 text-[#AEAFB3] line-clamp-1 mt-[2px]">
                        {item.file_type}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          ref={btnRef}
          className={`${s.btnWrap} absolute bottom-0 left-0 w-full h-[124px] z-20 bg-gradient-to-t from-[#fff] to-[#fff]-50  pt-[40px] pb-[20px] flex justify-center`}
        >
          <Popover
            trigger="click"
            content={popoverContent}
            getPopupContainer={() => btnRef.current}
          >
            <div className="bg-[#03060E] rounded-[8px] w-[180px] h-[42px] text-white flex items-center justify-center">
              <IconPlus className="text-[16px] mr-[2.5px]" />
              <div className="text-[16px] leading-[20px]">{t('Add')}</div>
            </div>
          </Popover>
        </div>
        <AddDoc
          visible={uploadVisible}
          setVisible={setUploadVisible}
          refresh={refreshKnowledge}
          collection_name={$selectedKnowledge.id}
        />
        <AddText
          visible={textVisible}
          onClose={() => {
            setTextVisible(false)
          }}
          refresh={refreshKnowledge}
          collection_name={$selectedKnowledge.id}
        />
      </div>
    </div>
  )
}

export default Knowledge
