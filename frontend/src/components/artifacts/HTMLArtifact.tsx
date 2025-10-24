import {useAtom} from 'jotai'

import {artifacts} from '~/lib/stores'

import Header from './components/Header'

export default function HTMLArtifact({className = ''}) {
  const [$artifact, setArtifact] = useAtom(artifacts)

  const getTitleFromHtml = (html: string): string | null => {
    const match = html.match(/<title>([^<]*)<\/title>/i)
    return match ? match[1].trim() : $artifact.type.toUpperCase()
  }
  return (
    <div className={`w-1/2 h-full relative border-l-[0.5px] ${className}`}>
      <Header
        title={getTitleFromHtml($artifact.content)}
        onClick={() => {
          setArtifact({
            type: '',
            content: '',
          })
        }}
      />
      <iframe
        title={getTitleFromHtml($artifact.content)}
        srcDoc={$artifact.content}
        className="h-3/4 w-[95%] min-h-[400px] my-14 mx-auto"
      />
    </div>
  )
}
