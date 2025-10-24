/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Message, Tooltip} from '@arco-design/web-react'
import {
  IconCopy,
  IconDownload,
  IconPlayArrowFill,
} from '@arco-design/web-react/icon'
import hljs from 'highlight.js'
import {useAtom} from 'jotai'
import katex from 'katex'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {useTranslation} from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeReact from 'rehype-react'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import IconArrow from '~/assets/ic_arrow.svg'
import {artifacts} from '~/lib/stores'
// import remarkPrism from 'remark-prism'
import {openWindow} from '~/utils/bridge'

import PlantUMLRenderer from '../PlantUML'
import {getFileInfo, isHtml, isSvg} from './const'
import s from './index.module.less'
import Mermaid from './Mermaid'
import thinkPlugin from './ThinkPlugin'

import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'

function PlantUML({code}) {
  return <PlantUMLRenderer code={code} />
}

function MathBlock({children}) {
  const formula = String(children).replace(/\n$/, '') // Remove trailing newline
  // const p = document.createElement('p')
  // p.innerHTML = formula
  // window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, p])
  const html = katex.renderToString(formula, {
    displayMode: true,
    leqno: false,
    fleqn: false,
    throwOnError: false,
  })
  return (
    <p style={{userSelect: 'none'}}>
      <p dangerouslySetInnerHTML={{__html: html}} />
    </p>
  )
}

function InlineMath({children}) {
  const formula = String(children).replace(/\n$/, '') // Remove trailing newline
  // const p = document.createElement('p')
  // p.innerHTML = formula
  // window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, p])
  // return React.createElement('p', p)
  const html = katex.renderToString(formula, {
    displayMode: false,
  })
  return (
    <p style={{userSelect: 'none'}}>
      <p dangerouslySetInnerHTML={{__html: html}} />
    </p>
  )
}

function CustomLink({href, children}) {
  const handleClick = (e) => {
    e.preventDefault()
    openWindow(href)
  }

  // 匹配 URL 及其后的内容
  const text = String(children)
  const match = text.match(/(https?:\/\/[^\s）)]+)([^]*)/)

  if (match) {
    const [_, url, remainingText] = match // 解构出 URL 和剩余文本
    return (
      <>
        <a
          href={url}
          onClick={handleClick}
          className="cursor-pointer text-[#4493f8]"
        >
          {url}
        </a>
        {remainingText}
      </>
    )
  }

  // 默认情况
  return (
    <a
      href={href}
      onClick={handleClick}
      className="cursor-pointer text-[#4493f8]"
    >
      {children}
    </a>
  )
}

function ThinkComponent({children, thinkType}) {
  const {t} = useTranslation()
  const thinkText = {
    0: 'Thinking···',
    1: 'Deeply thought',
    2: 'Thinking has stopped',
  }
  // 这里定义 <think> 标签的展示样式
  const [isVisible, setIsVisible] = useState(true)
  return (
    <div data-tag="think" className="mb-[10px]">
      <button
        className="flex items-center text-[#565759] text-[14px] leading-[16px] mb-[6px]"
        onClick={() => setIsVisible(!isVisible)}
      >
        {t(thinkText[thinkType])}
        <img
          src={IconArrow}
          alt=""
          className={`${isVisible ? '-rotate-90' : 'rotate-90'} transition-all duration-75`}
        />
      </button>
      {isVisible && (
        <div
          className={s.think}
          style={{
            borderLeft: '3px solid #D1D1D1',
            padding: '0 10px',
            margin: '10px 0',
            fontSize: '14px',
            lineHeight: '16px',
            color: '#7C7D80',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

const handleDownload = (children, language) => {
  // 获取纯文本代码内容（去除末尾换行符）
  const codeContent = String(children).replace(/\n$/, '')

  // 根据语言类型确定文件扩展名和 MIME 类型
  const {extension, mimeType} = getFileInfo(language)

  // 创建 Blob 对象
  const blob = new Blob([codeContent], {type: mimeType})

  // 生成下载链接并触发点击
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `code.${extension}` // 默认文件名：code.扩展名
  a.click()

  // 释放内存
  URL.revokeObjectURL(url)
}

function CodeBlock({node, inline, className, children, ...props}) {
  const [, setArtifact] = useAtom(artifacts)
  const {t} = useTranslation()
  const codeRef = useRef(null)

  const match = /language-(\w+)/.exec(className || '')
  const language = (match && match[1]) || 'plaintext'

  useEffect(() => {
    if (codeRef.current && !inline && match) {
      ;(hljs as any).highlightElement(codeRef.current)
    }
  }, [children, inline, match])

  if (className === 'language-mermaid') {
    return <Mermaid chart={String(children)} />
  }
  if (className === 'language-plantuml') {
    return <PlantUML code={String(children)} />
  }
  return !inline && match ? (
    <div className={s.code_editor_style}>
      {/* 标题栏（显示语言名称和复制按钮） */}
      <div className={s.code_header}>
        <p>{language}</p>
        <div className="flex gap-1">
          <Tooltip content={t('Copy')}>
            <div>
              <CopyToClipboard
                text={String(children).replace(/\n$/, '')}
                onCopy={() => {
                  Message.success(t('Copy successfully'))
                }}
              >
                <button className={s.copy_button}>
                  <IconCopy />
                  {t('Copy')}
                </button>
              </CopyToClipboard>
            </div>
          </Tooltip>

          <Tooltip content={t('Download')}>
            <button
              className={s.copy_button}
              onClick={() => handleDownload(children, language)}
            >
              <IconDownload />
              {t('Download')}
            </button>
          </Tooltip>

          {['html', 'xml', 'svg'].includes(language) ? (
            <Tooltip content={t('Run')}>
              <button
                className={s.copy_button}
                onClick={() => {
                  localStorage.setItem('botMenuVisible', '')
                  const storageEvent = new StorageEvent('storage', {
                    key: 'botMenuVisible',
                    url: window.location.href,
                  })
                  window.dispatchEvent(storageEvent)
                  setArtifact({
                    type: isSvg(children) ? 'svg' : language,
                    content: children,
                  })
                }}
              >
                <IconPlayArrowFill />
                {t('Run')}
              </button>
            </Tooltip>
          ) : null}
        </div>
      </div>

      {/* 代码高亮区域 */}
      {/* <SyntaxHighlighter
        style={oneLight}
        language={language}
        showLineNumbers // 显示行号
        wrapLongLines
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter> */}
      <pre>
        <code
          ref={codeRef}
          className={`hljs language-${language} bg-[#fafafa] text-[14px]`}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </code>
      </pre>
    </div>
  ) : (
    <code className={`${className} whitespace-normal`} {...props}>
      {children}
    </code>
  )
}

function CustomLi({children, ...props}) {
  const processedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'p') {
      return (child.props as any).children
    }
    return child
  })

  return <li {...props}>{processedChildren}</li>
}
// 自定义图片组件
function CustomImage({src, alt}) {
  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer" // 绕过防盗链
    />
  )
}

function MarkdownText({message, isSending = false}) {
  const [thinkType, setThinkType] = useState(-1) // -1 不展示， 0 思考中， 1 思考结束
  const components = useMemo<any>(
    () => ({
      code: CodeBlock,
      think: ({children}) => ThinkComponent({children, thinkType}),
      a: CustomLink,
      math: MathBlock,
      inlineMath: InlineMath,
      img: CustomImage,
    }),
    [thinkType]
  )

  useEffect(() => {
    if (/<think\b[^>]*>/i.test(message) && !/<\/think>/i.test(message)) {
      setThinkType(isSending ? 0 : 2)
    } else if (/<think\b[^>]*>/i.test(message) && /<\/think>/i.test(message)) {
      setThinkType(1)
    }
  }, [message, isSending])

  const processedValue = (text) => {
    if (!text) return text
    let newText = text

    if (/<think\b[^>]*>/i.test(newText) && !/<\/think>/i.test(newText)) {
      newText = `${newText}\n</think>`
    }
    const returnText = newText
      ?.replace(/~/g, '\\~')
      ?.replace(/\\\(/g, '$') // 转换 \(...\) 为 $...$
      ?.replace(/\\\)/g, '$')
      ?.replace(/\\\[/g, '$$') // 转换 \[...\] 为 $$...$$
      ?.replace(/\\\]/g, '$$')
      ?.replace(/<think>/g, ':::think\n')
      ?.replace(/<\/think>/g, '\n:::\n')
    return returnText
    // ?.replace(/<think>([\s\S]*?)<\/think>/gi, (_, content) => {
    //   const lines = content
    //     .trim()
    //     .split('\n')
    //     .map((line: string) => (line ? `> ${line}` : '>'))
    //     .join('\n')
    //   return lines
    // })
  }

  return (
    <div className={`markdown-body ${s['markdown-body']}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm, remarkDirective, thinkPlugin]}
        rehypePlugins={[
          [rehypeReact, {createElement: React.createElement}],
          rehypeRaw,
          rehypeKatex,
        ]}
        components={components}
        className="w-full"
      >
        {processedValue(message || '')}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownText
