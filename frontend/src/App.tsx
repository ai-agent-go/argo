import loadable from '@loadable/component'
import React, {useEffect} from 'react'
import {withTranslation} from 'react-i18next'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import Layout from './layout'
import {getAccountType} from './lib/apis/workspace'
import {isInArgo} from './utils'

import './App.css'
import './tailwind.css'
import 'tippy.js/dist/tippy.css'
import 'github-markdown-css/github-markdown.css'

function App() {
  const [ready, setReady] = React.useState(false)
  const confirmFunc = async (v, cb) => {
    if (isInArgo()) {
      const result = await window.argoBridge.showDialog(v)
      cb(!result.response)
      return
    }
    // eslint-disable-next-line no-alert
    const result = window.confirm(v)
    cb(result)
  }

  const accountType = async () => {
    const res = await getAccountType()
    localStorage.setItem('enableMultiUser', res.enable_multi_user)
    setReady(true)
    if (window.location.pathname === '/auth' && !res.enable_multi_user) {
      window.location.pathname = '/'
    }
  }

  useEffect(() => {
    accountType()
  }, [])

  if (!ready) return null

  return (
    <Router getUserConfirmation={confirmFunc}>
      <Switch>
        <Route
          exact
          path="/auth"
          component={loadable(() => import('~/pages/auth'))}
        />
        <Route
          render={() => {
            return <Layout />
          }}
        />
      </Switch>
    </Router>
  )
}

export default withTranslation()(React.memo(App))
