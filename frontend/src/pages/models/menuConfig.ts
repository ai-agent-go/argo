import loadable from '@loadable/component'
import {t} from 'i18next'

import ModelInstall from './images/modelInstall'
import ModelStore from './images/modelsStore'

export const menuTabs = (spaceId) => {
  return [
    {
      src: ModelInstall,
      path: `/space/${spaceId}/models/installed`,
      key: 'Installed Model',
      name: t('Installed Model'),
    },
    {
      src: ModelStore,
      path: `/space/${spaceId}/models/store`,
      key: 'Models Store',
      name: t('Models Store'),
    },
  ]
}

const routes = () => {
  return [
    {
      path: '/space/:spaceId/models/installed',
      exact: true,
      name: 'Installed Model',
      component: loadable(() => import('./installedModel')),
    },
    {
      path: '/space/:spaceId/models/store',
      exact: true,
      name: 'Models Store',
      component: loadable(() => import('./modelStore')),
    },
  ]
}

export default routes
