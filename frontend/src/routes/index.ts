import loadable from '@loadable/component'

const routes = () => {
  return [
    {
      path: '/auth',
      exact: true,
      name: '',
      component: loadable(() => import('../pages/auth')),
    },
    {
      path: '/bots',
      component: loadable(() => import('../pages/bots')),
    },
    {
      path: '/space/:spaceId/models',
      exact: true,
      name: 'Models',
      component: loadable(() => import('../pages/models/model')),
    },
    {
      path: '/space/:spaceId/knowledge',
      exact: true,
      name: 'Knowledge',
      component: loadable(() => import('../pages/knowledgeRepository')),
    },
    {
      path: '/space/:spaceId/MCPtools',
      exact: true,
      name: 'Tools',
      component: loadable(() => import('../pages/MCPtools')),
    },
    {
      path: '/space/:spaceId/bot/:botId',
      exact: true,
      name: '',
      component: loadable(() => import('../pages/bots/detail')),
    },
  ]
}

export default routes
