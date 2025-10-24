import {Message, Modal, Progress, Tooltip} from '@arco-design/web-react'
import {t} from 'i18next'
import {useEffect, useState} from 'react'

import {isInArgo} from '~/utils'
import {getPath, migrateData, openLogFolder} from '~/utils/bridge'

import s from './index.module.less'

function DataFile() {
  const [currentPath, setCurrentPath] = useState('')
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const getCurrentPath = async () => {
    if (!isInArgo()) {
      return
    }
    const path = await getPath()
    setCurrentPath(path)
  }

  const changePath = async () => {
    if (!isInArgo()) {
      Message.error(
        t(
          'This feature is not supported on the web version for now. Please use it in the client.'
        )
      )
      return
    }
    const res = await migrateData()
    if (res?.success) {
      setCurrentPath(res.newPath)
      const timer = setTimeout(() => {
        setVisible(false)
        clearTimeout(timer)
      }, 2000)
    } else if (res?.message) {
      Message.error(t(res.message))
      setVisible(false)
    }
  }

  const openFolder = (openDirectory) => {
    if (!isInArgo()) {
      Message.error(
        t(
          'This feature is not supported on the web version for now. Please use it in the client.'
        )
      )
      return
    }
    openLogFolder(openDirectory)
  }

  useEffect(() => {
    getCurrentPath()

    if (window.argoBridge) {
      window.argoBridge.getMigrationProgress((v, value) => {
        setProgress(value)
        setVisible(true)
      })
    }
  }, [])
  return (
    <div>
      <div className="my-5 mx-6">
        <div className="h-[36px] flex justify-between items-center mb-5">
          <div className="text-[#03060E] text-[16px] font-500">
            {t('Log file')}（app.log）
          </div>
          <div
            className="text-[#133EBF] text-[13px] cursor-pointer"
            onClick={() => openFolder(false)}
          >
            {t('Open')}
          </div>
        </div>
        <div className="h-[56px] flex justify-between items-center pt-5 border-t-[0.5px] border-[#EBEBEB]">
          <div className="flex items-center">
            <span className="text-[#03060E] text-[16px] font-500">
              {t('Application data directory')}
            </span>
            <Tooltip content={currentPath}>
              <div className="text-[#565759] font-400 ml-3 truncate max-w-[400px]">
                {currentPath}
              </div>
            </Tooltip>
          </div>
          <div className="text-[#133EBF] text-[13px] cursor-pointer">
            <span onClick={changePath}>{t('Change and migrate data')}</span>
            <span
              className="ml-5 cursor-pointer"
              onClick={() => openFolder(true)}
            >
              {t('Open')}
            </span>
          </div>
        </div>
      </div>

      <Modal
        visible={visible}
        title={null}
        footer={null}
        simple
        unmountOnExit
        className="py-5 px-10 rounded-[16px] w-[480px]"
      >
        <div className="bg-[url('~/assets/install_cardbg.png')">
          <div>
            <div className="text-[#03060E] font-600 text-[20px] text-center">
              {progress === 100
                ? t('Data migration is completed')
                : t('Data migration in progress')}
            </div>
            <div className="text-[#565759] font-400 text-[14px] leading-[160%] mb-6 text-center">
              {t(
                'The software will automatically restart after the data migration is completed'
              )}
            </div>
            <Progress
              percent={progress}
              className={`mb-[10px] ${s.customProgress}`}
              color="#03060E"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DataFile
