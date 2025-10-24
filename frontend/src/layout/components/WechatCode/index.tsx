import {useEffect} from 'react'

import srcImg from './wechat.jpg'

function WechatCode({showQrcode, setShowQrcode, style = {bottom: '4px'}}: any) {
  const showQrcodeClick = (e) => {
    if ((e.target as HTMLElement).id !== 'wechatJoin') {
      setShowQrcode(false)
    }
  }

  useEffect(() => {
    // 预加载
    const image = new Image()
    image.src = srcImg
  }, [])

  useEffect(() => {
    // 预加载
    if (showQrcode) {
      setTimeout(() => {
        document.addEventListener('click', showQrcodeClick)
      })
    } else {
      document.removeEventListener('click', showQrcodeClick)
    }
    return () => {
      document.removeEventListener('click', showQrcodeClick)
    }
  }, [showQrcode])

  if (!showQrcode) return null
  return (
    <div
      style={style}
      className="w-40 px-2.5 pt-4 pb-3 h-[236px] z-40 bg-white shadow-xl rounded-lg flex flex-col items-center justify-between absolute left-14 cursor-default"
      onClick={(e) => e.stopPropagation()}
      id="wechatJoin"
    >
      <img draggable="false" className="w-40" src={srcImg} alt="" />
      <div className="text-[10px] text-[#aeafb3]">
        扫一扫上面的二维码，加入我们！
      </div>
    </div>
  )
}

export default WechatCode
