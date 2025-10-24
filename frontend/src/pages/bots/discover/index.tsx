import {useAtom} from 'jotai'
import {useEffect, useRef} from 'react'
import {useHistory} from 'react-router-dom'

import {currentWorkspace} from '~/lib/stores'

function Discover() {
  const history = useHistory()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  const sendFlagRef = useRef(false)
  const handleDownloadBot = (e) => {
    const {data, origin} = e
    if (sendFlagRef.current || !origin.includes('www.xark-argo.com')) return
    sendFlagRef.current = true
    if (data) {
      history.push({
        pathname: `/bots/${$currentWorkspace.id}`,
        state: {data},
      })
    }
  }
  useEffect(() => {
    window.addEventListener('message', handleDownloadBot)
    return () => {
      window.removeEventListener('message', handleDownloadBot)
    }
  }, [])
  return (
    <div className="flex-1 h-full">
      <iframe
        src={`https://www.xark-argo.com/botsInArgo?url=${window.location.origin}`}
        // src={`http://localhost:7088/botsInArgo?url=${window.location.origin}`}
        title="argo"
        className="w-full h-full"
        frameBorder="0"
      />
    </div>
  )
}

export default Discover
