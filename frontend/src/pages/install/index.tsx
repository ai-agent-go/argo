import {Popover} from '@arco-design/web-react'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useParams} from 'react-router-dom'

import NavBar from '~/components/Navbar/Navbar'
import {getBotConfig} from '~/lib/apis/bots'

import Installation from '../../components/Installation/Installation'
import InputImg from './input.svg'

function Chat() {
  const {t} = useTranslation()
  const [detail, setDetail] = useState({
    icon: '',
    name: '',
    description: '',
    model_config: {prologue: ''},
  })

  const {botId = '', spaceId} = useParams<{botId: string; spaceId: string}>()

  const getBotDetail = async () => {
    const data = await getBotConfig(botId)
    setDetail(data)
  }

  useEffect(() => {
    getBotDetail()
  }, [])

  return (
    <div className="flex flex-col w-full relative justify-between h-full overflow-y-scroll">
      <NavBar name={detail.name} icon={detail.icon} />
      <div className="flex flex-col items-center mt-8">
        {detail.icon && (
          <img className="w-[72px] h-[72px] mb-5" src={detail.icon} alt="" />
        )}
        <div className="mb-2.5 text-2xl font-medium text-[#03060e]">
          {detail.name}
        </div>
        <div className="mb-10 text-base text-[#565759] font-normal leading-[26px] h-[78px] w-7/12 text-center overflow-hidden">
          {t(detail.description)}
        </div>

        <Installation botId={botId} spaceId={spaceId} detail={detail} />
      </div>

      <div className="bottom-5 w-full cursor-not-allowed mt-8 mb-[30px]">
        <img src={InputImg} alt="" className="mx-auto" />
      </div>
    </div>
  )
}

export default Chat
