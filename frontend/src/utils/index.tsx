import {Message} from '@arco-design/web-react'
import {t} from 'i18next'

import {userSignIn} from '~/lib/apis/auths'

const svgMap = new Map()

export async function loadScripts(urls) {
  if (!urls || urls.length === 0) return ''
  return urls.forEach((url) => {
    const script = document.createElement('script')
    script.src = `${url}`
    document.body.appendChild(script)
  })
}

export const checkImageSize = (file, limit = {w: 300, h: 300}, msg = '') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const image = new Image()
      image.onload = () => {
        const {width, height} = image
        if (width >= limit.w && height >= limit.h) {
          resolve(true)
        } else {
          Message.error(
            msg ||
              `The image size should not be less than ${limit.w}*${limit.h}`
          )
          reject()
        }
      }
      image.onerror = () => {
        Message.error(`something wrong`)
        reject()
      }
      image.src = e.target.result as any
    }
    reader.onerror = () => {
      Message.error(`something wrong`)
      reject()
    }
    reader.readAsDataURL(file)
  })
}

export const autoLogin = async () => {
  if (localStorage.getItem('enableMultiUser') === 'true') {
    window.location.href = '/auth'
  } else {
    const data = await userSignIn('default@default.com', 'default')
    localStorage.setItem('token', data.token)
    window.location.reload()
  }
}

export const isInArgo = () => {
  return window.navigator.userAgent.includes('argo')
}

export const awaitTime = (time = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1)
    }, time)
  })
}

export const validateAndDisplayJSON = (jsonStr) => {
  try {
    // 1. 检查是否是字符串
    if (typeof jsonStr !== 'string') {
      throw new Error('输入不是字符串类型')
    }

    // 2. 尝试解析 JSON
    const parsedData = JSON.parse(jsonStr)

    // 3. 可选：检查解析后的数据类型（如必须为对象）
    if (typeof parsedData !== 'object' || parsedData === null) {
      throw new Error('JSON 必须是对象类型')
    }

    // 4. 若校验通过，格式化并展示
    const formattedJson = JSON.stringify(parsedData, null, 2)
    return formattedJson
  } catch (error) {
    return jsonStr
  }
}

export const loadSVG = async (url) => {
  if (svgMap.has(url)) {
    const ele = svgMap.get(url)
    return ele
  }

  const response = await fetch(url)
  const svgText = await response.text()
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgElement = svgDoc.documentElement
  svgMap.set(url, svgElement)
  // 插入到容器
  // container.appendChild(svgElement)
  // if (cb) {
  //   svgElement.querySelectorAll('[fill]').forEach((el) => {
  //     el.removeAttribute('fill')
  //   })
  //   cb(svgElement)
  // }
  return svgElement
}

export const sortByFirstLetter = (arr) => {
  return arr.slice().sort((a, b) => {
    if (a === '') return 1 // 空字符串排最后
    if (b === '') return -1
    return a.localeCompare(b, undefined, {sensitivity: 'base'})
  })
}

export const validateFirstChar = async (value, callback) => {
  return new Promise((resolve) => {
    const regex = /^[A-Za-z0-9\u4e00-\u9fa5]/
    if (!regex.test(value[0])) {
      setTimeout(() => {
        callback(
          t(
            'The first character must be a letter, number, or Chinese character'
          )
        )
        resolve('pass')
      }, 1000)
    } else {
      resolve('pass')
    }
  })
}
