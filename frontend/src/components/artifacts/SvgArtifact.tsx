import {useAtom} from 'jotai'

import {artifacts} from '~/lib/stores'

import Header from './components/Header'

export default function SvgArtifact({className = ''}) {
  const [$artifact, setArtifact] = useAtom(artifacts)
  return (
    <div className={`w-1/2 h-full relative border-l-[0.5px] ${className}`}>
      <Header
        title="SVG"
        onClick={() => {
          setArtifact({
            type: '',
            content: '',
          })
        }}
      />
      <div
        className="overflow-auto h-3/4 w-5/6 min-h-[400px] my-14 mx-auto"
        dangerouslySetInnerHTML={{__html: $artifact.content}}
      />
    </div>
  )
}
