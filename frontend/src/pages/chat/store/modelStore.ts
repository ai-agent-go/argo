import {getModelList} from '~/lib/apis/models'

// ModelStore.js
class ModelStore {
  models = []

  listeners = new Set()

  // 获取当前模型列表
  getModels() {
    return [...this.models] // 返回副本避免直接修改
  }

  // 更新模型列表
  async updateModels() {
    const data = await getModelList({is_generation: true})
    this.models = [...data.model_list]
    this.notifyListeners()
    return [...this.models] // 返回副本避免直接修改
  }

  clearModels() {
    this.models = []
    return [...this.models] // 返回副本避免直接修改
  }

  // 订阅数据变化
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // 通知所有订阅者
  notifyListeners() {
    this.listeners.forEach((listener: any) => listener())
  }
}

// 导出单例实例
export const modelStore = new ModelStore()
