import {Message} from '@arco-design/web-react'
import {IconLoading} from '@arco-design/web-react/icon'
import {useAtom} from 'jotai'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import WechatCode from '~/layout/components/WechatCode'
import {getChangeLog} from '~/lib/apis/settings'
import {isDownloaded, isLatestVersion, updateProgress} from '~/lib/stores'
import {getAppVersion, openWindow, restartApp} from '~/utils/bridge'

import discord from './discord.svg'
import github from './github.svg'
import icon from './icon.svg'
import s from './index.module.less'
import wechat from './wechat.svg'

function About() {
  const {t, i18n} = useTranslation()
  const [$isLatestVersion] = useAtom(isLatestVersion)
  const [$updateProgress] = useAtom(updateProgress)
  const [$isDownloaded] = useAtom(isDownloaded)
  const [msg, setMsg] = useState('')
  const [showQrcode, setShowQrCode] = useState(false)
  const [version, setVersion] = useState('')
  // const [info, setInfo] = useState({version: '', size: 580.32})

  // const speedMB = (speedBytes) =>
  //   Number((speedBytes / (1024 * 1024)).toFixed(2))

  const getLogs = async () => {
    try {
      const data = await getChangeLog()
      setMsg(data.msg)
      // const isWindow = false
      // const platform = await getPlatform()
      // // isWindow = platform === 'win32'
      // setInfo({
      //   version: data.version,
      //   size: isWindow ? data.window_size : data.mac_size,
      // })
    } catch (err) {
      Message.error(err.msg)
    }
  }

  const getVersion = async () => {
    const data = await getAppVersion()
    setVersion(data)
  }

  useEffect(() => {
    getVersion()
    getLogs()
  }, [])

  const renderBtn = () => {
    if ($isLatestVersion) {
      return (
        <div className="bg-[#F9F9F9] rounded-[8px] box-border px-3 py-[9px] text-[#565759]">
          {t('Latest version')}
        </div>
      )
    }
    if ($isDownloaded) {
      // 有新版本重启更新时
      return (
        <div
          onClick={restartApp}
          className="bg-[#ffffff] border-[1px] border-[#133EBF] text-[#133EBF] rounded-[8px] box-border px-3 py-[9px]"
        >
          {t('Restart to update')}
        </div>
      )
    }
    if ($updateProgress) {
      // 下载中
      return (
        <div className="bg-[#ffffff] flex gap-1 items-center border-[1px] border-[#133EBF] text-[#133EBF] rounded-[8px] box-border px-3 py-[9px]">
          <IconLoading className="text-[#133EBF]" />
          {t('Downloading')}
        </div>
      )
    }
    // 最新版本时
    return (
      <div className="bg-[#F9F9F9] rounded-[8px] box-border px-3 py-[9px] text-[#565759]">
        {t('Latest version')}
      </div>
    )
  }
  return (
    <div className="mt-6 pb-5 px-6 h-full box-border overflow-scroll no-scrollbar">
      <div className="flex pb-5 border-b-[0.5px] border-[#EBEBEB]">
        <img src={icon} alt="" className="w-25 h-25 mr-5" />
        <div className="flex-1">
          <div className="flex justify-between mb-[10px] w-full">
            <div className="text-[#03060E] font-700 text-[24px] leading-[36px]">
              Argo{version ? `(v${version})` : ''}
            </div>
            {renderBtn()}
          </div>
          <div className="text-[#565759] mt-3 text-[14px] font-400 leading-[150%]">
            {t(
              'Argo is a localized large model Agent development tool that enables everyone to easily assemble open source large models, local corpora, and tool plugins to build their own large model applications'
            )}
          </div>
        </div>
      </div>
      <div className="py-5 flex justify-between items-center border-b-[0.5px] border-[#EBEBEB]">
        <div className="text-[#03060E] font-500 text-[16px] leading-[20px]">
          {t('Docs')}
        </div>
        <div
          className="text-[#133EBF] font-500 leading-[18px] text-[13px] cursor-pointer"
          onClick={() => {
            if (i18n.language === 'en') {
              openWindow('https://docs.xark-argo.com')
            } else {
              openWindow('https://docs.xark-argo.com/zh-CN/getting-started/')
            }
          }}
        >
          {t('View')}
        </div>
      </div>
      <div className="py-5 flex justify-between items-center border-b-[0.5px] border-[#EBEBEB]">
        <div className="text-[#03060E] font-500 text-[16px] leading-[20px]">
          {t('Contact us')}
        </div>
        <div className="flex items-center gap-[16px]">
          <div
            onClick={() => {
              openWindow('https://github.com/xark-argo/argo')
            }}
            className="flex rounded-[8px] cursor-pointer items-center justify-center gap-1 text-[#03060E] font-500 text-[13px] px-3 py-[9px] border-[1px] border-[#EBEBEB]"
          >
            <img src={github} alt="" />
            {t('Github')}
          </div>
          <div
            onClick={() => {
              openWindow('https://discord.com/invite/TuMNxXxyEy')
            }}
            className="flex rounded-[8px] cursor-pointer items-center justify-center gap-1 text-[#03060E] font-500 text-[13px] px-3 py-[9px] border-[1px] border-[#EBEBEB]"
          >
            <img src={discord} alt="" />
            {t('Discord')}
          </div>
          <div
            onClick={() => {
              setShowQrCode(true)
            }}
            className="flex relative rounded-[8px] cursor-pointer items-center justify-center gap-1 text-[#03060E] font-500 text-[13px] px-3 py-[9px] border-[1px] border-[#EBEBEB]"
          >
            <img src={wechat} alt="" />
            {t('WeChat')}
            <WechatCode
              style={{
                bottom: '20px',
                right: 0,
                left: 'unset !important',
              }}
              showQrcode={showQrcode}
              setShowQrcode={setShowQrCode}
            />
          </div>
        </div>
      </div>
      <div className="py-5 ">
        <div className="flex justify-between items-center">
          <div className="text-[#03060E] font-500 text-[16px] leading-[20px]">
            {t('Update Log')}
          </div>
          {/* <div className="text-[#133EBF] font-500 leading-[18px] text-[13px]">
            {t('View all')}
          </div> */}
        </div>
        <div
          className={`mt-[6px] prose leading-[160%] ${s.markdown} markdown-body`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            className="w-full"
          >
            {msg}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default About
