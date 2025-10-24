import {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

function SetVariableBox({
  position,
  insetVarial,
  keyEvent,
  value,
  addTool,
  addVariable,
  addKnowledge,
  selectedList,
}) {
  const [selectItemIdx, setSelectItemIdx] = useState(0)
  const {t} = useTranslation()
  const itemRefs = useRef([])
  const [variableList, setVariableList] = useState([])
  const [toolsList, setToolsList] = useState([])
  const [knowledgeLength, setKnowledgeLength] = useState(0)
  const listContainer = useRef(null)

  const variableAction = () => {
    switch (selectItemIdx) {
      case knowledgeLength + 1:
        addVariable()
        break
      case variableList.length + knowledgeLength + 2:
        addTool()
        break
      case 0:
        addKnowledge()
        break
      default:
        if ((value.network || selectedList.length) && selectItemIdx === 1) {
          insetVarial('#context#')
          return
        }
        if (selectItemIdx >= variableList.length + knowledgeLength + 3) {
          insetVarial(
            toolsList[selectItemIdx - variableList.length - knowledgeLength - 3]
          )
          return
        }
        insetVarial(variableList[selectItemIdx - knowledgeLength - 2])
    }
  }

  const formatItem = (item, index, type = 'insert') => {
    return (
      <div
        key={item}
        className={`rounded-lg cursor-pointer ${index === selectItemIdx && 'bg-sky-100'}`}
        ref={(el) => {
          itemRefs.current[index] = el
        }}
        onMouseEnter={() => {
          setSelectItemIdx(index)
        }}
        onClick={variableAction}
      >
        {type === 'insert' && (
          <span className="text-blue-500 mx-2 inline-block w-8">{'{x}'}</span>
        )}
        {type === 'add' && (
          <span className="text-purple-500 mx-2 inline-block w-8">ADD</span>
        )}
        <span className="">{item}</span>
      </div>
    )
  }

  const handleKeyup = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      variableAction()
    }
    if (e.key === 'ArrowUp') {
      setSelectItemIdx((prevIdx) =>
        prevIdx === 0
          ? variableList.length + toolsList.length + knowledgeLength + 2
          : prevIdx - 1
      )
    }
    if (e.key === 'ArrowDown') {
      setSelectItemIdx((prevIdx) =>
        prevIdx === variableList.length + toolsList.length + knowledgeLength + 2
          ? 0
          : prevIdx + 1
      )
    }
  }

  useEffect(() => {
    const selectedItem = itemRefs.current[selectItemIdx]
    const containerHeight = listContainer.current.clientHeight
    const itemTop = selectedItem.offsetTop
    const itemBottom = itemTop + selectedItem.offsetHeight
    if (itemTop < listContainer.current.scrollTop) {
      // 如果选中项在容器顶部之外，滚动到选中项的顶部
      listContainer.current.scrollTop = itemTop
    } else if (itemBottom > listContainer.current.scrollTop + containerHeight) {
      // 如果选中项在容器底部之外，滚动到选中项的底部
      listContainer.current.scrollTop = itemBottom - containerHeight
    }
  }, [selectItemIdx])

  useEffect(() => {
    if (keyEvent) {
      handleKeyup(keyEvent)
    }
  }, [keyEvent])

  useEffect(() => {
    if (value.network || selectedList.length) {
      setKnowledgeLength(1)
    } else {
      setKnowledgeLength(0)
    }
  }, [value, selectedList])

  useEffect(() => {
    if (value.tool_config.length || value.user_input_form.length) {
      const listTool = value.tool_config.map((item) => item.outputs[0])
      const listInput = value.user_input_form.map((item) => {
        const [, info]: any = Object.entries(item)[0]
        return info.variable
      })
      setVariableList(listInput)
      setToolsList(listTool)
    }
  }, [value.tool_config, value.user_input_form])

  return (
    <div
      className="fixed bg-white w-60 border border-slate-50 rounded-md p-2 z-[1] max-h-44 overflow-auto"
      style={{top: position.y + 25, left: position.x + 16}}
      ref={listContainer}
    >
      {formatItem(t('Add knowledge'), 0, 'add')}
      {knowledgeLength ? formatItem(t('Knowledge'), 1) : null}
      <hr />
      {formatItem(t('Add variable'), knowledgeLength + 1, 'add')}
      {variableList?.map((item, index) =>
        formatItem(item, index + knowledgeLength + 2)
      )}
      <hr />
      {formatItem(
        t('Add tools'),
        variableList.length + knowledgeLength + 2,
        'add'
      )}
      {toolsList?.map((item, index) =>
        formatItem(item, index + variableList.length + knowledgeLength + 3)
      )}
    </div>
  )
}

export default SetVariableBox
