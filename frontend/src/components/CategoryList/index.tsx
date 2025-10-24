import {Tooltip} from '@arco-design/web-react'

import CategoryItem from './item'

function CategoryList({list}) {
  return (
    <div className="flex items-center gap-1">
      {list
        ?.sort((a, b) => {
          if (a === '') return 1 // 空字符串排最后
          if (b === '') return -1
          return a.category.localeCompare(b.category, undefined, {
            sensitivity: 'base',
          })
        })
        .map((v) => {
          return (
            <div key={v.category}>
              <Tooltip content={v.prompt}>
                <div>
                  <CategoryItem url={v.icon_color} />
                </div>
              </Tooltip>
            </div>
          )
        })}
    </div>
  )
}

export default CategoryList
