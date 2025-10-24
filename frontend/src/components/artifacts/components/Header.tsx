import {IconClose} from '@arco-design/web-react/icon'

export default function Header({title, onClick}) {
  return (
    <div className="flex justify-between items-center px-4 h-14 font-600 text-[18px] border-b-[0.5px]">
      <div>{title}</div>
      <IconClose className="cursor-pointer" onClick={onClick} />
    </div>
  )
}
