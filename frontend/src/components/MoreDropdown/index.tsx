import {Dropdown, Menu, Tooltip} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

function MoreDropdown({
  children,
  list,
  position = 'bottom',
}: {
  children: any
  list: any[]
  position?: 'bottom' | 'top'
}) {
  const {t} = useTranslation()

  const dropList = (
    <Menu className="w-full max-w-[260px] rounded-[8px] relative gap-1 p-2 border border-gray-300/30 z-50 bg-white shadow">
      {list.map((item) => (
        <Menu.Item
          key={item.key}
          className="flex  gap-2  items-center px-2 py-[6px] text-sm  font-medium cursor-pointer hover:bg-[#F9F9F9] rounded-[6px]"
          onClick={() => {
            item.onClick()
          }}
        >
          {item.item}
        </Menu.Item>
      ))}
    </Menu>
  )
  return (
    <Dropdown trigger="click" droplist={dropList} position={position}>
      <Tooltip content={t('More')}>{children}</Tooltip>
    </Dropdown>
  )
}

export default MoreDropdown
