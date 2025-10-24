import {useAtom} from 'jotai'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import IconEmpty from '~/assets/empty.svg'
import {currentWorkspace} from '~/lib/stores'

function EmptyContent() {
  const {t} = useTranslation()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  return (
    <div className="h-full justify-center text-center p-6 bg-white flex flex-col items-center">
      <img src={IconEmpty} className="w-[60px] h-[60px]" />
      <div>
        {t('There is no tool yet, please click to go to the ')}
        <Link
          to={`/space/${$currentWorkspace.id}/MCPtools`}
          className="font-600 text-blue-700 cursor-pointer"
          draggable="false"
        >
          {t('Tool page')}
        </Link>
        {t('to configure')}.
      </div>
    </div>
  )
}

export default EmptyContent
