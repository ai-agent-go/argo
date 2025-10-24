import {Input, Message, Modal, Popover} from '@arco-design/web-react'
import {IconSearch} from '@arco-design/web-react/icon'
import {useAtom} from 'jotai'
import {dump} from 'js-yaml'
import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory, useLocation, useParams} from 'react-router-dom'

import EllipsisHorizontal from '~/components/icons/EllipsisHorizontal'
import FailInstallIcon from '~/components/icons/FailInstalled'
import InstallingIcon from '~/components/icons/Installing'
import UneditedIcon from '~/components/icons/Unedited'
import UninstalledIcon from '~/components/icons/Uninstalled'
import {
  addBot,
  deleteBot,
  exportBotInfo,
  getBotList,
  getBotShareInfo,
  importBotDSL,
} from '~/lib/apis/bots'
import {LOGO} from '~/lib/constants'
import {activeChat, currentWorkspace} from '~/lib/stores'
import CreateIcon from '~/pages/assets/CreateIcon'
import ImportIcon from '~/pages/assets/ImportIcon'
import {isInArgo} from '~/utils'

import CreateBotByDSL from '../components/CreateBotBySDL'
import ModifyModal from '../components/ModifyModal'
import MoreMenu from '../components/MoreMenu'

function Bots() {
  const location = useLocation()
  const history = useHistory()
  const {t} = useTranslation()
  const messageRef = useRef(false)
  const {spaceId} = useParams<{spaceId: string}>()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const [, setActiveChat] = useAtom(activeChat)
  const [searchValue, setSearchValue] = useState('')
  const [importVisible, setImportVisible] = useState(false)
  const [botList, setBotList] = useState([])
  const [searchList, setSearchList] = useState([])
  const timer = useRef(null)
  const modifyModalRef = useRef(null)
  const loadingRef = useRef(false)

  const INSTALL_STATUS = {
    uninstall: {
      img: <UninstalledIcon />,
      text: 'Uninstall',
      color: 'text-[#aeafb3]',
    },
    installing: {
      img: <InstallingIcon />,
      text: 'Installing...',
      color: 'text-[#52ccc3]',
    },
    fail: {
      img: <FailInstallIcon />,
      text: 'Installation failed',
      color: 'text-[#eb5746]',
    },
    Unedited: {
      img: <UneditedIcon />,
      text: 'Unedited',
      color: 'text-[#aeafb3]',
    },
  }

  const getList = async () => {
    try {
      if (!spaceId || Number(spaceId) === 0) {
        // history.replace(`/`)
        return
      }
      setSearchValue('')
      const data = await getBotList({space_id: spaceId})
      setBotList(data.bots)
      setSearchList(data.bots)
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const getFilterList = () => {
    const filters = botList.filter((bot) =>
      bot.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    setSearchList(filters)
  }

  const handleSubmit = async (val) => {
    try {
      const data = await addBot({
        ...val,
        icon: val.icon || LOGO,
        space_id: spaceId,
      })
      if (data.space_id && data.id) {
        history.push(`/space/${data.space_id}/bot/${data.id}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteBotHandler = async (item) => {
    try {
      await deleteBot({
        space_id: spaceId,
        bot_id: item.id,
      })
      Message.success(t('Delete Success'))
      getList()
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  // const downloadBotHandler = async (item) => {
  //   try {
  //     const data = await exportBotDSL(item.id)
  //     const exportBlob = new Blob([data.data])
  //     const link = document.createElement('a')
  //     link.href = window.URL.createObjectURL(exportBlob)
  //     link.setAttribute('download', `${item.name}.yml`)
  //     link.click()
  //     link.remove()
  //   } catch (err) {
  //     Message.error(err.msg || 'Server error, try again later')
  //   }
  // }

  const jumpPage = (item) => {
    setActiveChat({})
    switch (item.status) {
      case 'normal':
        history.push(`/bots/${spaceId}/chat?botId=${item.id}`)
        break
      case 'Unedited':
        history.push(`/space/${spaceId}/bot/${item.id}`)
        break
      default:
        history.push(`/bots/${spaceId}/install/${item.id}`)
    }
  }

  const handleImportDSL = async (vals) => {
    try {
      if (!spaceId || loadingRef.current) return
      loadingRef.current = true
      const data = await importBotDSL({
        files: vals.map((v) => v.originFile),
        space_id: spaceId,
      })
      if (data.bots && data.bots.length > 0) {
        jumpPage(data.bots[0])
      }
      Message.clear()
      Message.success(t('Import Success'))
      setImportVisible(false)
      getList()
      loadingRef.current = false
      Message.clear()
    } catch (err) {
      const msg = t(err.msg)
      Message.error(msg || 'Server error, try again later')
    } finally {
      loadingRef.current = false
    }
  }

  const getBotByPostMessage = async (e) => {
    const {data} = e
    if (
      typeof data === 'object' &&
      data.bot &&
      !messageRef.current &&
      spaceId
    ) {
      messageRef.current = true
      try {
        const dataJson: any = dump(data)
        const blob = new Blob([dataJson])
        const file = new File([blob], `${dataJson.name}.yml`)
        Message.loading('Waiting for Bot Import')
        await handleImportDSL([{originFile: file}])
        // messageRef.current = false
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleShareBot = async (item) => {
    try {
      const data = await getBotShareInfo(item.id)
      const copyText = JSON.stringify({
        ...data,
        host: window.location.host,
      })
      const otherWindow = window.open(
        // 'http://192.168.43.44:7088/bot/create'
        'https://www.xark-argo.com/bot/create'
      )
      if (isInArgo()) {
        try {
          window.argoBridge.sendShareText(copyText)
        } catch (err) {
          console.error(err)
        }
      } else {
        let count = 0
        const timerInterval = setInterval(() => {
          if (count >= 5) {
            clearInterval(timerInterval)
          } else {
            count += 1
            otherWindow.postMessage(
              copyText,
              // 'http://192.168.43.44/7088/bot/create'
              'https://www.xark-argo.com/bot/create'
            )
          }
        }, 500)
      }
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const circleGetList = async () => {
    if (botList.some((item) => item.status === 'installing')) {
      timer.current = setInterval(async () => {
        await getList()
        if (!botList.some((item) => item.status === 'installing')) {
          clearInterval(timer.current)
        }
      }, 2000)
    }
  }

  const renderStatus = (status) => {
    if (status === 'normal') {
      return null
    }
    const obj = INSTALL_STATUS[status]
    return (
      <div className="flex items-center gap-1">
        <div className="w-3 h-3">{obj.img}</div>
        <span className={`text-[10px] ${obj.color}`}>{obj.text}</span>
      </div>
    )
  }

  useEffect(() => {
    circleGetList()
    return () => {
      clearInterval(timer.current)
    }
  }, [botList])

  useEffect(() => {
    if ((!spaceId || Number(spaceId) === 0) && $currentWorkspace.id) {
      history.replace(`/bots/${$currentWorkspace.id}`)
    } else {
      getList()
      if (isInArgo()) {
        const data = (location?.state as any)?.data
        if (data) {
          getBotByPostMessage({data})
          location.state = {}
        }
      } else {
        window.addEventListener('message', getBotByPostMessage)
      }
    }
    // getBotByClipboard()
    return () => {
      window.removeEventListener('message', getBotByPostMessage)
    }
  }, [])

  useEffect(() => {
    getFilterList()
  }, [searchValue])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center p-5 h-[82px] border-b-[0.5px] border-b-[#EBEBEB]">
        <div className="flex items-center gap-4">
          <div
            onClick={modifyModalRef.current?.openModifyModal}
            className="w-[116px] cursor-pointer h-[42px] bg-[#03060E] rounded-[8px] text-[#fff] text-[14px] flex items-center justify-center gap-1"
          >
            <CreateIcon className="stroke-[#fff]" />
            {t('Create')}
          </div>
          <div
            onClick={() => setImportVisible(true)}
            className="w-[116px] cursor-pointer h-[42px] bg-[#fff] rounded-[8px] text-[#03060E] border-[#03060E] border-[1px] text-[14px] flex items-center justify-center gap-1"
          >
            <ImportIcon className="stroke-[#03060E]" />
            {t('Import')}
          </div>
        </div>
        <div className="border-[0.5px] h-[42px] border-[#EBEBEB] rounded-[8px] flex space-x-2 bg-white">
          <div className="flex flex-1 items-center px-3">
            <IconSearch className="w-[20px] h-5 flex-shrink-0" />
            <Input
              className=" w-full bg-transparent outline-none overflow-hidden border-transparent focus:border-transparent"
              value={searchValue}
              onChange={(v) => setSearchValue(v)}
              placeholder={t('Search')}
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-5 overflow-y-scroll">
        {searchList.map((item) => (
          <div
            key={item.id}
            className="text-left p-4 bg-white h-[146px] border-[0.5px] border-[#EBEBEB] rounded-[8px] flex flex-col gap-1 hover:cursor-pointer"
            onClick={() => {
              jumpPage(item)
            }}
          >
            <div className="relative flex items-center justify-start gap-2.5">
              <img
                src={item.icon}
                className="rounded-md w-[40px] aspect-square object-cover"
                alt="model"
                loading="lazy"
              />
              <div className="w-10/12 mb-1">
                <Popover
                  content={item.name}
                  position="tl"
                  style={{marginLeft: '-40px'}}
                >
                  <div
                    className="text-ellipsis overflow-hidden text-nowrap text-[#03060e]"
                    aria-describedby="tippy-10"
                  >
                    {item.name}
                  </div>
                </Popover>
                {renderStatus(item.status)}
              </div>
            </div>
            <Popover
              content={t(item.description)}
              position="bl"
              style={{marginLeft: '-40px'}}
            >
              <div
                className="w-11/12 h-8 overflow-hidden leading-4 line-clamp-2 text-[#575759] mb-1.5"
                style={{fontSize: 10}}
              >
                {t(item.description)}
              </div>
            </Popover>
            <div className="flex justify-between items-center">
              <button className="w-[72px] h-7 rounded-md text-[#03060e] border-[0.5px] border-[#03060e] hover:text-white hover:bg-[#03060e]">
                {t('chat')}
              </button>
              <div className="flex justify-start p relative">
                {!item.locked ? (
                  <div className="flex flex-col items-center flex-shrink-0 justify-center absolute -right-1 -top-1.5">
                    <MoreMenu
                      editHandler={() => {
                        history.push(`/space/${spaceId}/bot/${item.id}`)
                      }}
                      handleDownload={async () => {
                        try {
                          const {blob, filename} = await exportBotInfo(item.id)
                          const url = window.URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.setAttribute(
                            'download',
                            decodeURIComponent(filename)
                          )
                          document.body.appendChild(link)
                          link.click()
                          link.remove()
                          window.URL.revokeObjectURL(url)
                        } catch (err) {
                          Message.error(t(err.msg))
                        }
                      }}
                      shareHandler={() => {
                        handleShareBot(item)
                      }}
                      deleteHandler={() => {
                        Modal.confirm({
                          title: t('Confirm your action'),
                          content: t(
                            'This action cannot be undone. Do you wish to continue?'
                          ),
                          onOk: () => {
                            deleteBotHandler(item)
                          },
                          cancelText: t('Cancel'),
                        })
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        aria-label="icon"
                        className="self-center w-fit text-sm hover:bg-black/5 rounded-xl"
                      >
                        <EllipsisHorizontal className="size-5 text-[#AEAFB3]" />
                      </button>
                    </MoreMenu>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ModifyModal
        ref={modifyModalRef}
        info={{icon: ''}}
        handleSubmit={handleSubmit}
      />
      <CreateBotByDSL
        visible={importVisible}
        onClose={() => {
          setImportVisible(false)
        }}
        handleSubmit={handleImportDSL}
      />
    </div>
  )
}

export default Bots
