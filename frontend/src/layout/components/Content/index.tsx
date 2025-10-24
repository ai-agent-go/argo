import React from 'react'
import {Redirect, Route, Switch} from 'react-router-dom'

import routes from '~/routes'

function Content({currentSpaceId}) {
  if (!currentSpaceId) return null
  return (
    <div className="flex-1 bg-white backdrop-blur-[80] rounded-tl-[16px] rounded-bl-[16px] overflow-hidden">
      <Switch>
        {routes().map(({path, component: ItemComponent}: any) => {
          return <Route key={path} path={path} component={ItemComponent} />
        })}
        <Redirect from="*" to={`/bots/${currentSpaceId}`} />
      </Switch>
    </div>
  )
}

export default React.memo(Content)
