import ModelItem from './ModelItem'

function ModelList({list}) {
  return (
    <div className="flex flex-col gap-1">
      {list?.map((item) => {
        return <ModelItem model={item} key={item.id} />
      })}
    </div>
  )
}

export default ModelList
