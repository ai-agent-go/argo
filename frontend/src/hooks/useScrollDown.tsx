import {useEffect, useState} from 'react'

const useAutoScroll = (ref) => {
  const [isAutoScrollActive, setAutoScrollActive] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current
      if (!element) return

      const {scrollTop, scrollHeight, clientHeight} = element

      // 判断是否用户在滚动该 div 元素
      if (
        scrollTop === 0 ||
        Math.ceil(scrollTop + clientHeight) >= scrollHeight
      ) {
        setAutoScrollActive(true)
      } else {
        setAutoScrollActive(false)
      }
    }

    const scrollElement = ref.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [ref])

  return isAutoScrollActive
}

export default useAutoScroll
