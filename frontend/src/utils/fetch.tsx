import {WEBUI_API_BASE_URL} from '~/lib/constants'

import {errorModal} from './errorModal'
import {autoLogin} from './index'

function getFilenameFromHeaders(headers) {
  const disposition = headers.get('Content-Disposition')
  const match = disposition?.match(/filename="?(.+?)"?$/)
  return match ? match[1] : 'download.file'
}

// const requestCache = new Map()

// function generateRequestKey(url, config) {
//   const {method = 'POST', params = {}} = config
//   return `${method.toUpperCase()}:${url}?${JSON.stringify(params)}`
// }

export const apiFetch = async (
  url,
  params,
  {method = 'POST', headers = {}, returnType = 'json'} = {}
) => {
  let error
  // const key = generateRequestKey(url, {params, method})
  // if (requestCache.has(key)) {
  //   return {}
  // }
  let body
  if (Object.prototype.toString.call(params) === '[object FormData]') {
    body = params
  } else if (method === 'GET') {
    body = undefined
  } else {
    body = JSON.stringify(params)
  }
  // requestCache.set(key, '')
  const res = await fetch(
    `${WEBUI_API_BASE_URL}${url}`,
    // `${import.meta.env.VITE_API_BASE_URL}${url}`,
    {
      method,
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.token}`,
        Origin: window.location.origin,
        ...headers,
      },
      credentials: 'include',
      body,
    }
  )
    .then(async (result) => {
      // requestCache.delete(key)
      // console.log(requestCache, 'delete', key)
      if (result.status === 401) {
        // 触发默认登录
        await autoLogin()
      }
      if (!result.ok) throw await result.json()

      if (returnType === 'blob') {
        const blob = await result.blob()
        return {
          blob,
          filename: getFilenameFromHeaders(result.headers),
        }
      }
      return result.json()
    })
    .catch((err) => {
      error = err
      if (!err || !err.msg) {
        errorModal.show()
      }
      return null
    })
  // .finally(() => {
  //   requestCache.delete(key)
  // })

  if (error && error.msg) {
    throw error
  }

  return res
}
