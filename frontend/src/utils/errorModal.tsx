import {createRef} from 'react'

class ErrorModalController {
  private static instance: ErrorModalController

  private modalRef: any = createRef<{
    show: (content: React.ReactNode) => void
  }>()

  static getInstance() {
    if (!this.instance) {
      this.instance = new ErrorModalController()
    }
    return this.instance
  }

  // 绑定组件引用
  bindRef(ref: any) {
    this.modalRef.current = ref
  }

  // 显示错误（核心逻辑）
  show() {
    this.modalRef.current?.show()
  }
}

export const errorModal = ErrorModalController.getInstance()
