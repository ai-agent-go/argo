import loadable from '@loadable/component'

import DiscoverIcon from '~/assets/discover.svg'
import BotIcon from '~/assets/icon_mybots.svg'

const routes = () => {
  return [
    {
      path: '/bots/discover',
      exact: true,
      name: 'Bots',
      component: loadable(() => import('./discover')),
    },
    {
      path: '/bots/:spaceId/chat/:chatId',
      exact: true,
      name: '',
      component: loadable(() => import('../chat')),
    },
    {
      path: '/bots/:spaceId/chat',
      exact: true,
      name: '',
      component: loadable(() => import('../chat')),
    },
    {
      path: '/bots/:spaceId/install/:botId',
      exact: true,
      name: '',
      component: loadable(() => import('../install')),
    },
    {
      path: '/bots/:spaceId',
      exact: true,
      name: 'Bots',
      component: loadable(() => import('./list')),
    },
  ]
}

export const MenuRoute = [
  {
    path: (spaceId) => `/bots/${spaceId}`,
    icon: BotIcon,
    name: 'My Bots',
  },
  {
    path: () => '/bots/discover',
    icon: DiscoverIcon,
    name: 'Discover Bots',
  },
]

export default routes
