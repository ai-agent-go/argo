import {Popover} from '@arco-design/web-react'
import {useAtom} from 'jotai'

import {botDetail, currentModel} from '~/lib/stores/chat'

import Live2dModel from '../Live2dModel'
import TabContainer from './TabContainer'

function RightDrawer({refreshBot, visible}) {
  const [$botDetail] = useAtom(botDetail)
  const [$currentModel] = useAtom(currentModel)

  return (
    <div
      className={`h-full relative ${$currentModel.live2dEnable ? 'w-[360px]' : ''}`}
    >
      <div
        className={`${visible ? 'w-[360px] border-l-[1px]' : 'w-[0px] overflow-hidden'} relative z-10 bg-white h-full box-border flex flex-col`}
      >
        <div className="w-full box-border flex items-center px-6  flex-shrink-0 py-[30px]">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden mr-[10px] flex-shrink-0">
            <img
              src={$botDetail.icon}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full flex flex-col justify-center overflow-hidden">
            <Popover content={$botDetail.name}>
              <div className="text-[#202021] w-full font-500 text-[16px] mb-[4px] truncate">
                {$botDetail.name}
              </div>
            </Popover>
            <Popover content={$botDetail.description}>
              <div className="text-[#8B8B8C] w-full text-[10px] leading-[14px] truncate text-wrap h-[28px]">
                {$botDetail.description}
              </div>
            </Popover>
          </div>
        </div>
        <TabContainer refreshBot={refreshBot} />
      </div>
      {$botDetail.category === 'roleplay' ? <Live2dModel /> : null}
    </div>
  )
}

export default RightDrawer
