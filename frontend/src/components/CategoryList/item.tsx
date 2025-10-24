import {useEffect, useRef, useState} from 'react'

import {loadSVG} from '~/utils'

function CategoryItem({url}) {
  const ref = useRef(null)
  const [svgEle, setSvgEle] = useState(null)
  const getData = async () => {
    const res = await loadSVG(url)
    const ele = res.cloneNode(true)
    setSvgEle(ele)
  }

  useEffect(() => {
    if (svgEle && ref.current) {
      ref.current.innerHTML = ''
      ref.current.appendChild(svgEle)
    }
  }, [svgEle])

  useEffect(() => {
    getData()
  }, [])

  return <div ref={ref} />
}

export default CategoryItem
