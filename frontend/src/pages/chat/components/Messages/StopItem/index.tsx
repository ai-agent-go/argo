import {useTranslation} from 'react-i18next'

import RegenIcon from '../assets/regen.svg'

function StopItem({handleRegen}) {
  const {t} = useTranslation()
  return (
    <div className="rounded-[6px] absolute  bottom-0 left-[66px] bg-white px-[6px] py-[3px] flex justify-center items-center gap-2">
      <div className="flex items-center text-[#565759] leading-[160%] text-[14px]">
        {t('Answer stopped')}
      </div>
      <div
        className="flex items-center text-[#133EBF] leading-[160%] text-[14px] cursor-pointer"
        onClick={handleRegen}
      >
        {t('Regenerate')}
        <img src={RegenIcon} alt="" />
      </div>
    </div>
  )
}

export default StopItem
