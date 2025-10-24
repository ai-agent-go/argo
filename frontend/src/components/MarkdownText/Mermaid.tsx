import throttle from 'lodash/throttle'
import mermaid from 'mermaid'
import React, {useEffect, useRef, useState} from 'react'
import {v4 as uuidv4} from 'uuid'

import MermaidModal from '../MermaidModal'

// Mermaid 初始化配置

function Mermaid({chart}) {
  const containerRef = useRef(null)
  const lastValidSvg = useRef('')
  const isError = useRef(false)
  const svgIdRef = useRef(uuidv4().replace(/-/g, '').substring(3, 8))
  const [visible, setVisible] = useState(false)
  const [containerHeight, setContainerHeight] = useState('auto') // 新增状态来保存容器高度

  const drawMermaid = throttle(async (v) => {
    let result
    const element = document.getElementById(svgIdRef.current)

    try {
      // 在开始渲染新图表前保存当前容器高度
      if (containerRef.current && containerRef.current.offsetHeight !== 0) {
        setContainerHeight(`${containerRef.current.offsetHeight}px`)
      }
      result = await mermaid.render(`mermaid-${svgIdRef.current}`, v)

      // setSvg(data.svg)
    } catch (error) {
      // console.error('Mermaid initialization failed:', new Date().getTime())
      isError.current = true
    } finally {
      if (isError.current) {
        if (lastValidSvg.current && element) {
          element.innerHTML = lastValidSvg.current
          await mermaid.run()
        }
      } else {
        element.innerHTML = result.svg
        await mermaid.run()
        lastValidSvg.current = result.svg
        setContainerHeight('auto')
      }
      isError.current = false
    }
  }, 1000)

  useEffect(() => {
    mermaid.contentLoaded()
  }, [])

  useEffect(() => {
    drawMermaid(chart)
  }, [chart])

  return (
    <>
      <div
        ref={containerRef}
        data-tag="mermaid"
        id={svgIdRef.current}
        className="mermaid"
        // dangerouslySetInnerHTML={{__html: svgContent}}
        style={{
          textAlign: 'center',
          overflow: 'auto',
          cursor: 'pointer',
          height: containerHeight,
        }}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setVisible(true)
        }}
      >
        {/* {chart} */}
      </div>
      <MermaidModal visible={visible} setVisible={setVisible} code={chart} />
    </>
  )
}

export default React.memo(Mermaid)
