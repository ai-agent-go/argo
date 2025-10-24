import {Switch} from '@arco-design/web-react'
import {t} from 'i18next'
import {useEffect, useState} from 'react'

function DeepResearchItem({detail, handleDeepResearch, modelList}) {
  const [disableSwitch, setDisableSwitch] = useState(false)
  useEffect(() => {
    if (detail.model_config?.model?.model_id) {
      const model = modelList.find(
        (item) => item.id === detail.model_config.model.model_id
      )
      const disable =
        model &&
        model?.category &&
        (model?.category?.category_label.category.length === 0 ||
          model?.category?.category_label?.category?.findIndex(
            (item) => item?.category === 'tools'
          ) === -1)
      setDisableSwitch(disable)
      if (disable) {
        handleDeepResearch(false)
      }
    }
  }, [detail.model_config?.model?.model_id, modelList])

  return (
    <div className="h-12 rounded-xl bg-gray-50 flex py-2 px-3 justify-between">
      <div className="flex items-center space-x-1 shrink-0 ">
        <svg
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="25"
        >
          <path
            d="M148.048193 604.53012l37.012048 67.855422 98.698795-55.518072-37.012048-67.855422-98.698795 55.518072zM493.493976 536.674699L419.46988 407.13253 259.084337 499.662651l74.024097 129.542168 160.385542-92.53012zM431.807229 357.783133l111.036144 191.228915 222.07229-129.542168-111.036145-191.228916-222.072289 129.542169zM734.072289 148.048193l-61.686747 37.012048 141.879518 252.915663 61.686747-37.012049-141.879518-252.915662zM530.506024 629.204819a92.16 92.16 0 0 0-21.466988-59.219277L350.689157 660.048193a93.270361 93.270361 0 0 0 31.768674 43.180723l-55.518072 172.722891h74.024096l49.349398-153.044819L499.662651 875.951807h74.024096l-61.686747-191.228915a92.036627 92.036627 0 0 0 18.506024-55.518073z"
            fill="#03060d"
          />
        </svg>
        <div className="text-sm font-semibold text-gray-800">
          {t('Deep Research')}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Switch
          className="[&.arco-switch-checked]:bg-[#03060d]"
          checked={
            detail?.model_config?.agent_mode.strategy ===
              'react_deep_research' && detail?.model_config?.agent_mode.enabled
          }
          disabled={disableSwitch}
          onChange={(v) => {
            handleDeepResearch(v)
          }}
        />
      </div>
    </div>
  )
}

export default DeepResearchItem
