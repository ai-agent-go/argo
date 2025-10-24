import {Route, Switch} from 'react-router-dom'

import routes from '../../menuConfig'

function Content() {
  return (
    <div className="flex-1 bg-white h-full overflow-hidden">
      <Switch>
        {routes().map(({path, component: ItemComponent}: any) => {
          return (
            <Route key={path} path={path} exact component={ItemComponent} />
          )
        })}
      </Switch>
    </div>
  )
}

export default Content
