import CategoryList from '~/components/CategoryList'
import OverflowTooltip from '~/components/OverflowTooltip'

function FormatValue({modelList, value}) {
  if (!modelList || !value) return null
  const modelInfo = modelList.find((v) => {
    if (typeof value === 'string') {
      return v.id === value
    }
    if (value && value.provider) {
      return (
        (value.name === v.model_name || value.model_name === v.model_name) &&
        value.provider === v.provider
      )
    }

    if (!value.model_id && !value.id) {
      return value.name === v.model_name || value.model_name === v.model_name
    }
    return value.model_id ? v.id === value.model_id : v.id === value.id
  })

  if (modelInfo) {
    return (
      <div className="relative flex items-center px-2 h-8 rounded-lg  cursor-pointer">
        {modelInfo.icon_url ? (
          <img
            alt="model-icon"
            src={modelInfo.icon_url}
            className="w-auto h-4 mr-1.5"
          />
        ) : null}
        <div className="flex items-center truncate text-[13px] gap-1 font-medium text-gray-800 mr-1.5 text-gray-900">
          <div className="truncate">
            <OverflowTooltip>{modelInfo.model_name}</OverflowTooltip>
          </div>
          <CategoryList
            list={modelInfo?.category?.category_label?.category || []}
          />
          {/* <div className="flex items-center px-1 h-[18px] rounded-[5px] border border-black/8 bg-white/[0.48] text-[10px] font-medium text-gray-500 cursor-default ml-1 !text-[#444CE7] !border-[#A4BCFD]">
            {t('CHAT')}
          </div> */}
        </div>
      </div>
    )
  }
  if (typeof value === 'string') return value
  if (value && value.provider) {
    return value.name || value.model_name
  }

  return value.model_name
}
export default FormatValue
