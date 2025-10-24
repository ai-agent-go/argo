// PlantUMLRenderer.tsx
import {encode} from 'plantuml-encoder'
import {useEffect, useState} from 'react'

import PlantUMLModal from './modal'

interface PlantUMLRendererProps {
  code: string
}

function PlantUMLRenderer({code}: PlantUMLRendererProps) {
  const [imgUrl, setImgUrl] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  // 生成 PlantUML 图片
  useEffect(() => {
    try {
      const encoded = encode(code)
      const url = `https://www.plantuml.com/plantuml/svg/${encoded}`
      setImgUrl(url)
    } catch (err) {
      console.error('PlantUML 渲染错误:', err)
    }
  }, [code])

  return (
    <div className="flex w-full justify-center">
      <img
        src={imgUrl}
        alt="PlantUML Diagram"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowModal(true)
        }}
        style={{cursor: 'pointer', maxWidth: '100%'}}
      />

      <PlantUMLModal
        code={code}
        url={imgUrl}
        visible={showModal}
        setVisible={setShowModal}
      />
    </div>
  )
}

export default PlantUMLRenderer
