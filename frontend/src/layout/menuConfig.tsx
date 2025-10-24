// import loadable from '@loadable/component'

import BotsImg from './assets/icon_bot.svg'
import KnowledgeImg from './assets/icon_knowledge.svg'
import ModelImg from './assets/icon_model.svg'
import ToolImg from './assets/icon_tool.svg'

export const menus = ({spaceId}) => {
  return [
    {
      path: `/bots/${spaceId}`,
      icon: BotsImg,
      name: 'Bots',
      children: [
        {
          path: `/bots/${spaceId}`,
          exact: true,
          name: 'Bots',
        },
        {
          path: '/bots/discover',
          exact: true,
          name: 'Bots',
        },
        {
          path: `/bots/${spaceId}/chat`,
          exact: true,
          name: 'Bots',
        },
        {
          path: `/bots/${spaceId}/install`,
          exact: true,
          name: 'Bots',
        },
      ],
    },
    {
      path: `/space/${spaceId}/models`,
      icon: ModelImg,
      name: 'Models',
    },
    {
      path: `/space/${spaceId}/knowledge`,
      icon: KnowledgeImg,
      name: 'Knowledge',
    },
    {
      path: `/space/${spaceId}/MCPtools`,
      icon: ToolImg,
      name: 'Tools',
    },
  ]
}

// const routes = () => {
//   return [
//     {
//       path: '/space/:spaceId/bots',
//       exact: true,
//       name: 'Bots',
//       component: loadable(() => import('./bots')),
//     },
//     {
//       path: '/space/:spaceId/models',
//       exact: true,
//       name: 'Models',
//       component: loadable(() => import('./models')),
//     },
//     {
//       path: '/space/:spaceId/knowledge',
//       exact: true,
//       name: 'Knowledge',
//       component: loadable(() => import('./knowledge')),
//     },
//     {
//       path: '/space/:spaceId/tools',
//       exact: true,
//       name: 'Tools',
//       component: loadable(() => import('./tools')),
//     },
//   ]
// }

// export default routes
