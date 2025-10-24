import {isInArgo} from '.'

export const openWindow = (url) => {
  if (!url) return
  if (isInArgo()) {
    window.argoBridge.openBrowser(url)
  } else {
    window.open(url)
  }
}

export const openLogFolder = (openDirectory = true) => {
  if (isInArgo()) {
    window.argoBridge.openLogFolder(openDirectory)
  }
}

export const changeLanguage = (language) => {
  if (isInArgo()) {
    window.argoBridge.changeLanguage(language)
  }
}

export const changeLanguageShowDialog = (language) => {
  if (isInArgo()) {
    window.argoBridge.changeLanguageAndShowDialog(language)
  }
}
export const openLocalFolder = (path) => {
  if (!path) return
  if (isInArgo()) {
    window.argoBridge.openLocalFolder(path)
  }
}

export const getAppVersion = async () => {
  if (isInArgo()) {
    const data = await window.argoBridge.getVersion()
    return data
  }
  return ''
}

export const restartApp = () => {
  if (isInArgo()) {
    return window.argoBridge.updateVersion()
  }
  return ''
}

export const getPlatform = () => {
  if (isInArgo()) {
    return window.argoBridge.getPlatform()
  }
  return ''
}

export const migrateData = () => {
  if (isInArgo()) {
    return window.argoBridge.migrateData()
  }
  return ''
}

export const getPath = () => {
  if (isInArgo()) {
    return window.argoBridge.getPath()
  }
  return ''
}
