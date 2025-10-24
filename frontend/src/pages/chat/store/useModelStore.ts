import {useEffect, useState} from 'react'

import {modelStore} from './modelStore'

export function useModelStore() {
  const [models, setModels] = useState(modelStore.getModels())

  useEffect(() => {
    const unsubscribe = modelStore.subscribe(() => {
      setModels(modelStore.getModels())
    })
    return () => {
      unsubscribe()
      modelStore.clearModels()
    }
  }, [])

  return {
    models,
    updateModels: modelStore.updateModels.bind(modelStore),
    clearModels: modelStore.clearModels,
  }
}
