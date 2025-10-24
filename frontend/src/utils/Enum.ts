interface ItemType {
  text: string
  value: number | string
  alias?: string
}

interface EnumType {
  [key: string]: ItemType
}

export class Enum<T extends EnumType> {
  private itemList: ItemType[]

  private itemMap

  constructor(items: T) {
    this.itemList = Object.entries(items).map(([key, value]) => ({
      alias: key,
      ...value,
    }))

    this.itemMap = items
  }

  public items(): ItemType[] {
    return this.itemList.map((item) => ({...item}))
  }

  // 转换成antd组件需要的格式 {value, label}
  public options() {
    return this.items().map((item) => ({value: item.value, label: item.text}))
  }

  public alias2Text = (alias: keyof T) => {
    if (!this.itemMap[alias]) {
      // eslint-disable-next-line no-console
      console.warn(`alias: "${alias as string}" 不存在`)
      return ''
    }

    return this.itemMap[alias].text
  }

  public alias2Value = (alias: keyof T): T[keyof T]['value'] | '' => {
    if (!this.itemMap[alias]) {
      // eslint-disable-next-line no-console
      console.warn(`alias: "${alias as string}" 不存在`)
      return ''
    }
    return this.itemMap[alias].value
  }

  public value2Text = (value: T[keyof T]['value']): T[keyof T]['text'] | '' => {
    const result = this.itemList.find(({value: val}) => val === value)
    if (!result) {
      return ''
    }

    return result.text
  }

  public value2alias = (
    value: T[keyof T]['value']
  ): T[keyof T]['text'] | '' => {
    const result = this.itemList.find(({value: val}) => val === value)
    if (!result) {
      return ''
    }

    return result.alias
  }

  public text2Value = (text: T[keyof T]['text']) => {
    const result = this.itemList.find(({text: txt}) => txt === text)
    if (!result) {
      return null
    }

    return result.value
  }
}
