import {Message} from '@arco-design/web-react'
import html2canvas from 'html2canvas'
import mermaid from 'mermaid'
import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch'
import {v4 as uuidv4} from 'uuid'

import ArgoModal from '../Modal'

import './index.less'

function MermaidDiagram({code, visible, setVisible}) {
  const {t} = useTranslation()
  const svgContent = useRef<any>('')
  // const [svgContent, setSvgContent] = useState<any>(null)
  const [tab, setTab] = useState('chart')
  const containerRef = useRef(null)

  useEffect(() => {
    if (visible) {
      setTab('chart')
    }
  }, [visible])

  useEffect(() => {
    if (tab === 'chart' && code && visible) {
      // mermaid.contentLoaded()

      const element = containerRef.current
      if (element) {
        element.innerHTML = ''
      }
      let svgInfo = ''
      mermaid
        .render(`mermaid-${uuidv4().replace(/-/g, '').substring(3, 8)}`, code)
        .then(async ({svg}: any) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg
            svgContent.current = svg
            svgInfo = svg
            await mermaid.run()
          }
        })
        .catch(async (error) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svgInfo || error
            await mermaid.run()
          }
        })
    }
  }, [code, visible, tab, containerRef.current])

  useEffect(() => {
    mermaid.contentLoaded()
  }, [])

  const handleCopyImage = async () => {
    try {
      const canvas = await html2canvas(containerRef.current!, {
        scale: 1, // 复制时使用原始分辨率
        useCORS: true,
      })

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({'image/png': blob}),
          ])
          Message.success(t('Copy successfully'))
        }
      }, 'image/png')
    } catch (err) {
      Message.error(t('Copy Failed'))
      console.error('复制图片失败:', err)
    }
  }

  const handleDownloadSVG = () => {
    const blob = new Blob([svgContent.current], {type: 'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mermaid.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPNG = async () => {
    try {
      const canvas = await html2canvas(containerRef.current!, {
        scale: 2, // 2倍分辨率
        useCORS: true,
      })

      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'mermaid.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      Message.success(t('Download Successfully'))
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
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      link.setAttribute('download', 'mermaid.txt')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      Message.error(t(err.msg))
    }
  }

  return (
    <ArgoModal
      footer={null}
      title={t('Mermaid Chart')}
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
          minScale={0.5}
          // maxScale={8}
          centerOnInit
          initialScale={1}
          wheel={{step: 0.1}}
          doubleClick={{disabled: true}}
        >
          {({zoomIn, zoomOut}) => (
            <>
              <TransformComponent>
                <div
                  ref={containerRef}
                  id="mermaid-svg"
                  // dangerouslySetInnerHTML={{__html: svgContent}}
                  className="mermaid w-full min-h-[480px]  flex items-center justify-center"
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
                  onClick={handleDownloadSVG}
                >
                  {t('Download SVG')}
                </div>
                <div
                  className="text-[#03060E] text-[14px] px-4 py-[6px] rounded-[6px] border-[1px] border-[#EBEBEB] bg-white leading-[22px] cursor-pointer"
                  onClick={handleDownloadPNG}
                >
                  {t('Download PNG')}
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      ) : null}
      {tab === 'code' ? (
        <div className="h-[500px] flex flex-col mermaidContainer">
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

export default MermaidDiagram
