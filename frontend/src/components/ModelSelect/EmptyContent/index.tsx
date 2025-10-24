import {useAtom} from 'jotai'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'

import IconEmpty from '~/assets/empty.svg'
import {currentWorkspace} from '~/lib/stores'

function EmptyContent() {
  const {t} = useTranslation()
  const [$currentWorkspace] = useAtom(currentWorkspace)
  return (
    <div className="max-h-[280px] text-center p-6 bg-white flex flex-col items-center">
      <img src={IconEmpty} className="w-[60px] h-[60px]" />
      <div>
        {t('There is no model yet. Please go to the')}{' '}
        <Link
          to={`/space/${$currentWorkspace.id}/models`}
          className="font-600 text-blue-700 cursor-pointer"
          draggable="false"
        >
          {t('model list')}{' '}
        </Link>{' '}
        {t('to download')}.
      </div>
    </div>
  )
}

export default EmptyContent
