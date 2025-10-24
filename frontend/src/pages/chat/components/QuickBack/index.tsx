import throttle from 'lodash/throttle'
import {useEffect, useState} from 'react'

import quickBackIcon from '../../../assets/ic_backtonew.svg'

function QuickBack({scrollRef, loading, handleScroll}) {
  const [isBottom, setIsBottom] = useState(true)
  const handleScrollBottom = throttle(() => {
    const element = scrollRef.current
    if (!element) return
    const {scrollTop: currentScrollTop, clientHeight, scrollHeight} = element
    if (currentScrollTop + clientHeight < scrollHeight - 20) {
      // 滚动到最底部
      setIsBottom(false)
    } else {
      setIsBottom(true)
    }
  }, 100)

  useEffect(() => {
    if (scrollRef.current) {
      handleScrollBottom()
      scrollRef.current.removeEventListener('scroll', handleScrollBottom)
      scrollRef.current.addEventListener('scroll', handleScrollBottom)
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScrollBottom)
      }
    }
  }, [])

  if (isBottom || loading) return null

  return (
    <div
      className="absolute bottom-4 left-[50%] -translate-x-1/2 cursor-pointer"
      onClick={() => {
        handleScroll()
        setIsBottom(true)
      }}
    >
      <img src={quickBackIcon} alt="" />
    </div>
  )
}

export default QuickBack
