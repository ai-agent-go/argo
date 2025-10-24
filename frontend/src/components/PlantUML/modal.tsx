import {Message} from '@arco-design/web-react'
import {useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch'

import ArgoModal from '../Modal'

import './index.less'

function PlantUMLModal({code, url, visible, setVisible}) {
  const {t} = useTranslation()
  const [tab, setTab] = useState('chart')
  const containerRef = useRef(null)

  const handleCopyImage = async () => {
    try {
      // 添加时间戳避免缓存问题
      const timestamp = Date.now()
      const imageUrl = url.replace('/svg/', '/png/')
      const res = await fetch(`${imageUrl}?t=${timestamp}`)

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const blob = await res.blob()

      await navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
      Message.success(t('Copy successfully'))
    } catch (err) {
      Message.error(t('Download Failed'))
    }
  }

  // 下载图片
  const downloadImage = async (format: 'png' | 'svg') => {
    try {
      const imageUrl = url.replace('/svg/', `/${format}/`)

      // 添加时间戳避免缓存问题
      const timestamp = Date.now()
      const res = await fetch(`${imageUrl}?t=${timestamp}`, {
        headers: {
          Accept: format === 'png' ? 'image/png' : 'image/svg+xml',
        },
      })

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `plantUml.${format}`
      document.body.appendChild(link)
      link.click()

      // 添加延迟确保下载完成
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl)
        link.remove()
      }, 1000)

      Message.success(t('Download successfully'))
    } catch (err) {
      Message.error(t('Download Failed'))
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(code).then(() => {
      Message.success(t('Copy successfully'))
    })
  }

  const handleDownloadTXT = () => {
    try {
      const blob = new Blob([code], {type: 'text/plain'})
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl

      link.setAttribute('plantUml', 'plantUml.txt')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      Message.error(t(err.msg))
    }
  }

  return (
    <ArgoModal
      footer={null}
      title={t('PlantUML Preview')}
      visible={visible}
      className="w-[1000px] px-0"
      handleClose={() => {
        setVisible(false)
      }}
      titleClassName="border-b-[1px] border-[#E7E7E7] pb-[18px]"
    >
      <div className="flex items-center h-12 box-border py-[14px] px-5 gap-4 ">
        <div
          className={`${tab === 'chart' ? 'text-[#03060E] font-500' : 'text-[#565759] font-400'} text-[14px] cursor-pointer`}
          onClick={() => {
            setTab('chart')
          }}
        >
          {t('Preview')}
        </div>
        <div
          className={`${tab === 'code' ? 'text-[#03060E] font-500' : 'text-[#565759] font-400'} text-[14px] cursor-pointer`}
          onClick={() => {
            setTab('code')
          }}
        >
          {t('Code')}
        </div>
      </div>
      {tab === 'chart' ? (
        <TransformWrapper
          // minScale={0.5}
          // maxScale={8}
          // initialScale={1}
          wheel={{step: 0.1}}
          doubleClick={{disabled: true}}
        >
          {({zoomIn, zoomOut}) => (
            <>
              <TransformComponent>
                <img
                  src={url.replace('/png/', '/svg/')} // 显示更清晰的 SVG
                  alt="PlantUML Full View"
                  ref={containerRef}
                  className="w-full h-[480px] object-contain"
                />
              </TransformComponent>
              <div className="h-[52px] flex justify-end gap-[10px] items-end mr-[10px]">
                <div
                  className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
                  onClick={() => {
                    zoomIn()
                  }}
                >
                  {t('Zoom In')}
                </div>
                <div
                  className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
                  onClick={() => {
                    zoomOut()
                  }}
                >
                  {t('Zoom Out')}
                </div>
                <div
                  className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
                  onClick={handleCopyImage}
                >
                  {t('Copy Image')}
                </div>
                <div
                  className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
                  onClick={() => {
                    downloadImage('svg')
                  }}
                >
                  {t('Download SVG')}
                </div>
                <div
                  className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
                  onClick={() => {
                    downloadImage('png')
                  }}
                >
                  {t('Download PNG')}
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      ) : null}
      {tab === 'code' ? (
        <div className="h-[500px] flex flex-col">
          <SyntaxHighlighter
            style={oneLight}
            language="mermaid"
            showLineNumbers // 显示行号
            wrapLongLines
            className="flex-1"
          >
            {code}
          </SyntaxHighlighter>
          <div className="h-[52px] flex justify-end gap-[10px] items-end mr-[10px]">
            <div
              className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
              onClick={handleCopyText}
            >
              {t('Copy Text')}
            </div>
            <div
              className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
              onClick={handleDownloadTXT}
            >
              {t('Download TXT')}
            </div>
          </div>
        </div>
      ) : null}
    </ArgoModal>
  )
}

export default PlantUMLModal
