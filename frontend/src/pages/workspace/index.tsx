import {useAtom, useAtomValue} from 'jotai'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Link,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom'

import SidebarIcon from '~/components/SidebarIcon'
// import MenuLines from '~/components/icons/MenuLines'
import {currentWorkspace, showSidebar, workspaces} from '~/lib/stores'

import routes, {menus} from './menuConfig'

function Workspace() {
  const $workspaces = useAtomValue(workspaces)
  const $currentWorkspace = useAtomValue(currentWorkspace)
  const history = useHistory()
  const {spaceId} = useParams<{spaceId: string}>()
  const [$showSidebar] = useAtom(showSidebar)
  const {pathname} = useLocation()
  const {t} = useTranslation()

  useEffect(() => {
    if (!spaceId && $workspaces.length > 0) {
      history.replace(`/bots/${$currentWorkspace.id}`)
    }
  }, [$workspaces])

  if (!spaceId) return null
  return (
    <div
      className={`flex flex-col w-full min-h-screen max-h-screen ${
        $showSidebar ? 'md:max-w-[calc(100%-260px)]' : ''
      }`}
    >
      <div className="h-[60px] border-b-[1px] border-[#EBEBEB] flex items-center">
        <SidebarIcon />
        <div className=" w-full h-full flex items-center justify-center gap-1">
          {menus({spaceId: $currentWorkspace?.id})?.map((item) => {
            const isActive = pathname.includes(item.name.toLocaleLowerCase())
            return (
              <div
                key={item.path}
                className={`flex items-center  box-border py-[4px] px-[10px] text-[#575759] ${isActive ? 'bg-[#03060E] rounded-[8px] text-[#fff]' : ''}`}
              >
                <Link className="flex items-center transition" to={item.path}>
                  <div className="w-[24px] h-[24px] mr-[3px]">
                    {/* {item.icon} */}
                    {item.icon({className: isActive ? 'text-[#fff]' : ''})}
                  </div>
                  {t(item.name)}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      <div className=" py-1 flex-1 max-h-full overflow-y-auto">
        <Switch>
          {routes().map(({path, component: ItemComponent}: any) => {
            return (
              <Route
                key={path}
                path={path}
                render={(routesProps) => {
                  return <ItemComponent {...routesProps} />
                }}
              />
            )
          })}
        </Switch>
      </div>
    </div>
  )
}

export default Workspace
