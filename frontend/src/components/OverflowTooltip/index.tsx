import {Tooltip} from '@arco-design/web-react'
import {useEffect, useRef, useState} from 'react'

function OverflowTooltip({children}) {
  const containerRef = useRef(null)
  const [isOverflow, setIsOverflow] = useState(false)

  // 检测是否溢出
  const checkOverflow = () => {
    if (containerRef.current) {
      const {scrollWidth, clientWidth, scrollHeight, clientHeight} =
        containerRef.current
      const isOverflowing =
        scrollWidth > clientWidth || scrollHeight > clientHeight
      setIsOverflow(isOverflowing)
    }
  }

  // 初始检测 + 监听变化
  useEffect(() => {
    checkOverflow()
    const resizeObserver = new ResizeObserver(checkOverflow)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [children])

  return isOverflow ? (
    <Tooltip
      content={<div style={{maxWidth: 300}}>{children}</div>}
      trigger="hover"
    >
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
    </Tooltip>
  ) : (
    <div
      ref={containerRef}
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

export default OverflowTooltip
