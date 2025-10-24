import React from 'react'

import BotLeft from './components/BotLeft'
import Content from './components/Content'

function Bots() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <BotLeft />
      <Content />
    </div>
  )
}

export default React.memo(Bots)
