import {Input, Message, Popover, Table, Tooltip} from '@arco-design/web-react'
import {IconExclamationCircleFill} from '@arco-design/web-react/icon'
import dayjs from 'dayjs'
import {t} from 'i18next'
import {useAtom} from 'jotai'
import {useEffect, useRef, useState} from 'react'

import EditIcon from '~/components/icons/EditIcon'
import EllipsisHorizontal from '~/components/icons/EllipsisHorizontal'
import FolderIcon from '~/components/icons/FolderIcon/FolderIcon'
import GarbageBin from '~/components/icons/GarbageBin'
import SettingIcon from '~/components/icons/Settings'
import MoreDropdown from '~/components/MoreDropdown'
import OverflowTooltip from '~/components/OverflowTooltip'
import {deleteDocument} from '~/lib/apis/documents'
import {deleteKnowledge, getKnowledgeDetailInfo} from '~/lib/apis/knowledge'
import {selectKnowledge} from '~/lib/stores'
import {formatSize} from '~/lib/utils'
import ConfirmAction from '~/pages/models/components/ConfirmAction'
import Search from '~/pages/models/images/search'
import {isInArgo} from '~/utils'

import AddDoc from '../AddDoc'
import {useKnowledgeListActions} from '../hooks'
import KnowledgeBaseModal from '../KnowledgeBaseModal'

export default function KnowledgeDetailPanel() {
  const [$selectKnowledge] = useAtom(selectKnowledge)
  const [openEdit, setOpenEdit] = useState(false)
  const [openAddDoc, setOpenAddDoc] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [deleteDoc, setDeleteDoc] = useState(null)
  const timer = useRef(null)
  const [detail, setDetail] = useState({
    collection_name: '',
    knowledge_name: '',
    description: '',
    partition_info: [],
  })

  const [filterDocument, setFilterDocument] = useState(null)
  const [forceDeleteText, setForceDeleteText] = useState('')
  const {deleteKnowledgeFromList} = useKnowledgeListActions()

  const handleFilterList = () => {
    const newList = detail.partition_info.filter((item) =>
      item.document_name.includes(searchValue)
    )
    setFilterDocument(newList)
  }

  const deleteModelHandler = async () => {
    try {
      const res = await deleteKnowledge({
        collection_name: $selectKnowledge.collection_name,
        force: !!forceDeleteText,
      })

      if (res) {
        Message.success(t('Deleted successfully'))
        deleteKnowledgeFromList($selectKnowledge)
        setForceDeleteText('')
      }
    } catch (err) {
      if (err.errcode === -137) {
        setForceDeleteText(err.msg)
      } else {
        Message.error(err.msg || 'Server error, try again later')
      }
    }
    setOpenDelete(false)
  }
  const getDetailValues = async () => {
    try {
      const data = await getKnowledgeDetailInfo({
        collection_name: $selectKnowledge.collection_name,
      })
      setDetail(data)
      return data
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    return {}
  }

  const getDetail = async () => {
    if (timer.current) {
      clearInterval(timer.current)
    }
    getDetailValues()
    timer.current = setInterval(async () => {
      const data = await getDetailValues()
      const downloadingList = data?.partition_info?.filter(
        (item) => item.document_status === 1
      )
      if (downloadingList.length === 0) {
        clearInterval(timer.current)
      }
    }, 5000)
  }

  const deleteDocumentHandler = async () => {
    try {
      await deleteDocument({
        collection_name: $selectKnowledge.collection_name,
        partition_name: deleteDoc.partition_name,
      })
      Message.success(t('Deleted successfully'))
      getDetail()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
    setDeleteDoc(null)
  }

  const moreList = (r) => {
    return [
      {
        key: 'delete',
        onClick: () => setDeleteDoc(r),
        item: (
          <>
            <GarbageBin strokeWidth="2" />
            <div className="flex items-center">{t('Delete')}</div>
          </>
        ),
      },
    ]
  }

  const columns = [
    {
      title: t('Document'),
      dataIndex: 'document_name',
      width: '300px',
      render: (item, r) => (
        <div
          className="text-[#133EBF] cursor-pointer line-clamp-2"
          onClick={() => {
            if (!r.document_path) return
            if (isInArgo()) {
              window.argoBridge.openLocalFolder(r.document_path)
            }
          }}
        >
          <OverflowTooltip>{item}</OverflowTooltip>
        </div>
      ),
    },
    {
      title: t('File size'),
      dataIndex: 'file_size',
      render: (item) => {
        return !item ? '未知' : formatSize(item)
      },
    },
    {
      title: t('Status'),
      dataIndex: 'document_status',
      render: (item, r) => {
        if (item === 1) {
          return r.progress
            ? `${t('Parsing')} - ${(r.progress * 100).toFixed(0)}%`
            : t('Waiting')
        }
        if (item === 2) {
          return (
            <div className="text-[#EB5746]">
              <Tooltip content={r.msg}>
                <IconExclamationCircleFill className="text-[#EB5746] mr-[2px] text-[16px]" />
                {t('Failed')}
              </Tooltip>
            </div>
          )
        }
        if (item === 3) {
          return t('Finished')
        }
        return ''
      },
    },
    {
      title: t('Update Time'),
      dataIndex: 'update_at',
      render: (item, r) => {
        if (item !== -1) {
          return dayjs.unix(item).format('YYYY-MM-DD HH:mm:ss')
        }
        if (r.create_at !== -1) {
          return dayjs.unix(r.create_at).format('YYYY-MM-DD HH:mm:ss')
        }
        return '-'
      },
    },
    {
      title: t('Action'),
      dataIndex: '',
      render: (_, r) => {
        return (
          <MoreDropdown list={moreList(r)}>
            <button
              aria-label="icon"
              className="self-center w-fit text-sm p-1.5  hover:bg-black/5 rounded-xl"
            >
              <EllipsisHorizontal className="size-5" />
            </button>
          </MoreDropdown>
        )
      },
    },
  ]

  useEffect(() => {
    getDetail()
    return () => {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
    }
  }, [$selectKnowledge.collection_name])

  useEffect(() => {
    handleFilterList()
  }, [searchValue, detail.partition_info])

  return (
    <>
      <div className="h-[100vh] overflow-auto">
        <div className="py-[22px] px-5 border-b-[0.5px] border-[#EBEBEB]">
          <div className="flex items-center gap-[3px]">
            <Tooltip content={$selectKnowledge.description}>
              <div className="text-[#03060E] font-700 text-[28px] cursor-default">
                {$selectKnowledge.knowledge_name}
              </div>
            </Tooltip>

            <Popover
              trigger="click"
              content={
                <div className="my-[-4px] mx-[-8px]">
                  <div
                    className="mb-1 w-[124px] h-9 flex items-center gap-[5px] pl-2 hover:bg-[#F9F9F9] cursor-pointer rounded-md "
                    onClick={() => {
                      setOpenEdit(true)
                    }}
                  >
                    <EditIcon /> {t('Edit')}
                  </div>
                  <div
                    className="mb-1 w-[124px] h-9 flex items-center gap-[5px] pl-2 hover:bg-[#F9F9F9] cursor-pointer rounded-md"
                    onClick={() => setOpenDelete(true)}
                  >
                    <GarbageBin strokeWidth="2" />
                    {t('Delete')}
                  </div>
                </div>
              }
            >
              <div
                className="text-ellipsis overflow-hidden text-nowrap text-[#03060e] cursor-pointer"
                aria-describedby="tippy-10"
              >
                <SettingIcon className="w-5 h-5" />
              </div>
            </Popover>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-5 flex gap-[50px] text-[#565759]">
            <div>
              {t('embeddingModel')}:
              <span className="text-[#03060E] font-500 ml-1">
                {$selectKnowledge.embedding_model}
              </span>
            </div>
            <div>
              {t('Similarity threshold')}:
              <span className="text-[#03060E] font-500 ml-1">
                {$selectKnowledge.similarity_threshold}
              </span>
            </div>
            <div>
              {t('Top K')}:
              <span className="text-[#03060E] font-500 ml-1">
                {$selectKnowledge.top_k}
              </span>
            </div>
          </div>
          {$selectKnowledge.folder && isInArgo() ? (
            <div className="mb-4 flex bg-[#F9F9F9] w-full h-[54px] border border-[#EBEBEB] rounded-lg items-center justify-between px-[13px]">
              <div className="flex flex-1 items-center gap-[6px]">
                <FolderIcon />
                {t('Bound to local folder')}：
                <div className="flex-1 max-w-[30vw] whitespace-nowrap text-ellipsis overflow-hidden">
                  <OverflowTooltip>{$selectKnowledge.folder}</OverflowTooltip>
                </div>
              </div>
              <div>{t('Folder changes are automatically synchronized')}</div>
            </div>
          ) : null}
          <div className="flex justify-between">
            <div
              className="w-fit px-5 h-10 rounded-lg border border-[#03060E] leading-10 text-center text-[#03060E] mb-4 cursor-pointer"
              onClick={() => {
                setOpenAddDoc(true)
              }}
            >
              + {t('Add Document')}
            </div>
            <Input
              className="h-10 w-[267px] border-[0.5px] rounded-lg border-[#ebebeb]"
              placeholder={t('Search')}
              prefix={<Search />}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e)
              }}
            />
          </div>

          <div className="relative">
            <Table
              columns={columns}
              data={filterDocument}
              rowKey="partition_name"
              scroll={{y: '50vh'}}
            />
            <div
              className={`absolute left-4 ${filterDocument?.length ? 'bottom-0' : 'mt-5'}`}
            >
              {t('documents number', {number: filterDocument?.length})}
              {filterDocument?.every((file) => !!file.file_size)
                ? `${t('total size', {
                    size: formatSize(
                      filterDocument?.reduce(
                        (sum, file) => sum + file.file_size,
                        0
                      )
                    ),
                  })}`
                : null}
            </div>
          </div>
        </div>
      </div>

      <KnowledgeBaseModal
        onSubmit={getDetail}
        visible={openEdit}
        setVisible={setOpenEdit}
        modalType="edit"
      />

      <AddDoc
        refresh={getDetail}
        collection_name={$selectKnowledge.collection_name}
        visible={openAddDoc}
        setVisible={setOpenAddDoc}
      />

      <ConfirmAction
        onClose={() => {
          if (deleteDoc) {
            setDeleteDoc(null)
          } else {
            setOpenDelete(false)
          }
        }}
        onOK={() => {
          if (deleteDoc) {
            deleteDocumentHandler()
          } else {
            deleteModelHandler()
          }
        }}
        visible={forceDeleteText || openDelete || deleteDoc}
        text={
          forceDeleteText ||
          t('This action cannot be undone.Do you wish to continue?')
        }
      />
    </>
  )
}
