import loadable from '@loadable/component'

import BotsImg from '../assets/BotsIcon'
import KnowledgeImg from '../assets/KnowledgeIcon'
import ModelImg from '../assets/ModelsIcon'
import ToolImg from '../assets/ToolIcon'

export const menus = ({spaceId}) => {
  return [
    {
      path: `/space/${spaceId}/bots`,
      icon: (props) => <BotsImg {...props} />,
      name: 'Bots',
    },
    {
      path: `/space/${spaceId}/models`,
      icon: (props) => <ModelImg {...props} />,
      name: 'Models',
    },
    {
      path: `/space/${spaceId}/knowledge`,
      icon: (props) => <KnowledgeImg {...props} />,
      name: 'Knowledge',
    },
    {
      path: `/space/${spaceId}/MCPtools`,
      icon: (props) => <ToolImg {...props} />,
      name: 'Tools',
    },
  ]
}

const routes = () => {
  return [
    {
      path: '/space/:spaceId/bots',
      exact: true,
      name: 'Bots',
      component: loadable(() => import('../bots')),
    },
    {
      path: '/space/:spaceId/models',
      exact: true,
      name: 'Models',
      component: loadable(() => import('../models/model')),
    },
    {
      path: '/space/:spaceId/knowledge',
      exact: true,
      name: 'Knowledge',
      component: loadable(() => import('../knowledgeRepository')),
    },
    {
      path: '/space/:spaceId/MCPtools',
      exact: true,
      name: 'Tool',
      component: loadable(() => import('../MCPtools')),
    },
  ]
}

export default routes
