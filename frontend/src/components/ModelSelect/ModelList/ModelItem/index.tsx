import CategoryList from '~/components/CategoryList'
import OverflowTooltip from '~/components/OverflowTooltip'

function ModelItem({model}) {
  return (
    <div className="relative flex items-center px-2 py-[5px] gap-[5px] box-border h-8 rounded-[6px]  cursor-pointer hover:bg-[#F9F9F9]">
      {model.icon_url ? (
        <img alt="model-icon" src={model.icon_url} className="w-auto h-4" />
      ) : null}
      <div className="flex items-center truncate text-[14px] font-medium text-[#03060E]">
        <OverflowTooltip>{model.model_name}</OverflowTooltip>
      </div>
      <CategoryList list={model?.category?.category_label?.category || []} />
    </div>
  )
}

export default ModelItem
