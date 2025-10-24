import {useAtom} from 'jotai'
import React from 'react'

import SidebarClose from '~/components/icons/SidebarClose'
import {showSidebar} from '~/lib/stores'

function SidebarIcon({className = ''}) {
  const [$showSidebar, setShowSidebar] = useAtom(showSidebar)

  if ($showSidebar) return null

  return (
    <div
      className="px-5"
      onClick={() => {
        setShowSidebar(true)
      }}
    >
      <SidebarClose className={className} />
    </div>
  )
}

export default SidebarIcon
