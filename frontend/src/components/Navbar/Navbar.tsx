import {useTranslation} from 'react-i18next'

import SidebarIcon from '~/components/SidebarIcon'

import EditIcon from '../icons/EditIcon'
import SidebarClose from '../icons/SidebarClose'

function NavBar({
  icon,
  name,
  visible = false,
  setVisible = () => {},
  showRight = false,
  showEdit = false,
  handleEdit = () => {},
}: any) {
  const {t} = useTranslation()
  return (
    <div className="px-5 py-[18px] bg-white h-[60px] w-full flex justify-between text-[#03060e] border-b-[0.5px]">
      <div className="gap-2.5 flex items-center">
        <SidebarIcon />
        {icon && <img className="w-6 h-6 rounded-[4px]" src={icon} alt="" />}
        <span className="font-500 text-base">{name}</span>
      </div>
      <div className="flex gap-3 justify-between items-center">
        {showEdit ? (
          <div
            className="w-[72px] h-[30px] rounded-[8px] flex items-center gap-[5px] pl-2 bg-white border-[0.5px] border-[#EBEBEB] cursor-pointer"
            onClick={handleEdit}
          >
            <EditIcon /> {t('Edit')}
          </div>
        ) : null}
        {showRight ? (
          <div
            onClick={() => {
              setVisible((pre) => !pre)
            }}
            className="w-6 h-6 rounded-[4px] overflow-hidden cursor-pointer flex items-center justify-center"
          >
            <SidebarClose
              className={`${visible ? 'bg-[#EBEBEB]' : ''} stroke-[#565759]`}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default NavBar
