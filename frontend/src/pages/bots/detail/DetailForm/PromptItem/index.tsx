import {Modal} from '@arco-design/web-react'
import PluginEditor from '@draft-js-plugins/editor'
import {
  CompositeDecorator,
  ContentState,
  EditorState,
  getDefaultKeyBinding,
  Modifier,
} from 'draft-js'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'

import {getBotPromptTemplate} from '~/lib/apis/bots'

import AddVariableNotice from '../AddVariableNotice'
import SetVariableBox from '../SetVariableBox'

import 'draft-js/dist/Draft.css'

function TagTagStrategyComponent({children}) {
  return <span style={{color: '#009eff'}}>{children}</span>
}

const PROMPT_TYPE = {
  simple: 'PROMPT',
  advanced: 'PROMPT',
}
function PromptItem({
  value,
  onChange,
  addVariable,
  addTool,
  addKnowledge,
  positionKey,
  selectedList,
}: {
  value?: any
  onChange?: any
  addVariable?: any
  addTool?: any
  addKnowledge?: any
  positionKey?: any
  selectedList?: any
}) {
  const {t} = useTranslation()
  const [mode, setMode] = useState('simple')
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef(null)
  const [cursorPos, setCursorPos] = useState({x: null, y: null})
  const [showVariableBox, setShowVariableBox] = useState(false)
  const [showVariableNotice, setShowVariableNotice] = useState(false)
  const [variableList, setVariableList] = useState([])
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  )
  const [keyEvent, setKeyEvent] = useState(null)
  const editorRef = useRef<PluginEditor>(null)
  const promptRef = useRef(null)
  const regex = /\{\{(?![\d_])[A-Za-z][A-Za-z0-9_]*\}\}|\{\{#context#\}\}/g // match variable and konwledge

  const createPromptTemplate = async () => {
    const knowledge =
      value?.agent_mode?.tools?.filter((v) => v.type === 'dataset') || []
    const shouldFetchPrompt = knowledge.length !== 0 || value?.network === true
    const data = await getBotPromptTemplate(shouldFetchPrompt)
    const prompt = (data?.prompt || '').replace('{{#pre_prompt#}}', inputValue)
    value.advanced_prompt = prompt
    setInputValue(prompt)
  }

  const getInputValue = (v) => {
    if (v === 'simple') {
      setInputValue(value?.pre_prompt)
    } else if (v === 'advanced' && !value.advanced_prompt) {
      createPromptTemplate()
    } else {
      setInputValue(value?.advanced_prompt)
    }
  }

  const toggleMode = () => {
    if (mode === 'simple') {
      value.prompt_type = 'advanced'
      setMode('advanced')
      getInputValue('advanced')
    } else {
      setMode('simple')
      getInputValue('simple')
      value.prompt_type = 'simple'
      value.advanced_prompt = ''
    }
  }

  // 计算光标位置
  const getCursorPosition = () => {
    requestAnimationFrame(() => {
      const selection = window.getSelection()
      if (!selection.rangeCount) return

      const range = selection.getRangeAt(0)

      const rect = range.getBoundingClientRect()

      const x = rect.left
      const y = rect.top

      const textRect = promptRef.current.getBoundingClientRect()
      if (
        y - textRect.top < 0 ||
        y - textRect.top > textRect.height ||
        textRect.top < 0
      ) {
        setShowVariableBox(false)
      } else {
        setShowVariableBox(true)
        setCursorPos({x, y})
      }
    })
  }

  const getEditorText = () => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlocksAsArray() // 获取所有的 contentBlock
    let text = ''
    blocks.forEach((block, index) => {
      if (index === blocks.length - 1) {
        text += `${block.getText()}`
      } else {
        text += `${block.getText()}\n` // 每个块的文本拼接，添加换行符
      }
    })
    return text
  }

  const searchVariable = () => {
    const text = getEditorText()
    const matches = [...text.matchAll(regex)].map((match) => match[0])
    const currentVariable = value.user_input_form.map((item) => {
      const [, info]: any = Object.entries(item)[0]
      return info.variable
    })
    const currentTool = value.tool_config.map((item) => item.outputs[0])
    const list = matches.filter(
      (item) =>
        !currentVariable.includes(item.slice(2, -2)) &&
        !currentTool.includes(item.slice(2, -2)) &&
        item !== '{{#context#}}'
    )
    setVariableList(Array.from(new Set(list)))
    if (list.length) {
      setShowVariableNotice(true)
    }
  }

  const handleChangePrePrompt = () => {
    if (showVariableBox) {
      return
    }
    const text = getEditorText()
    setInputValue(text)
    if (mode === 'simple') {
      value.pre_prompt = text
    } else {
      value.advanced_prompt = text
    }
    value.prompt_type = mode
  }

  const insertText = (textToInsert) => {
    const currentEditorState = editorState
    const selectionState = currentEditorState.getSelection()

    const newContentState = Modifier.insertText(
      currentEditorState.getCurrentContent(),
      selectionState,
      textToInsert
    )
    let position = 0
    if (textToInsert === '{}}') {
      position = textToInsert.length - 2
    } else {
      position = textToInsert.length
    }

    const newSelectionState = selectionState.merge({
      anchorOffset: selectionState.getFocusOffset() + position,
      focusOffset: selectionState.getFocusOffset() + position,
    })

    const newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      'insert-characters'
    )
    // 更新内容和光标位置
    setEditorState(
      EditorState.forceSelection(newEditorState, newSelectionState)
    )
    setShowVariableBox(false)
  }

  const handleGetCurrentCharacter = () => {
    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const currentBlock = contentState.getBlockForKey(
      selectionState.getStartKey()
    ) // 获取光标所在的块
    const currentText = currentBlock.getText() // 获取该块的文本

    const cursorPosition = selectionState.getStartOffset() // 获取光标的位置
    const currentCharacter = currentText.charAt(cursorPosition - 1) // 获取光标处的字符

    if (currentCharacter === '{') {
      getCursorPosition()
    } else {
      setShowVariableBox(false)
    }
  }

  const handleTagStrategy = (
    block,
    callback: (start: number, end: number) => void
  ) => {
    const text = block.getText()
    let matchArr = regex.exec(text)
    let start
    while (matchArr !== null) {
      start = matchArr.index
      callback(start, start + matchArr[0].length)
      matchArr = regex.exec(text)
    }
  }

  const TagDecoratorPlugin = {
    decorators: [
      new CompositeDecorator([
        {
          strategy: handleTagStrategy,
          component: TagTagStrategyComponent,
        },
      ]),
    ],
  }
  const keyBindingFn = (e) => {
    if (showVariableBox) {
      setKeyEvent(e)
      if (e.keyCode === 13) {
        // 13是回车键（Enter）
        return 'no-enter' // 返回自定义命令来禁用回车键
      }
      if (e.keyCode === 9) {
        // 9是Tab键
        return 'no-tab' // 返回自定义命令来禁用Tab键
      }
      if (
        e.keyCode === 37 ||
        e.keyCode === 38 ||
        e.keyCode === 39 ||
        e.keyCode === 40
      ) {
        return 'no-arrow' // 禁用方向键（上下左右）
      }
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      requestAnimationFrame(() => {
        const selection = window.getSelection()
        const textChunk = selection.anchorNode.textContent
        const position = selection.anchorOffset
        const textBeforeCursor = textChunk[position - 1]
        if (textBeforeCursor === '{') {
          getCursorPosition()
        } else {
          setShowVariableBox(false)
        }
      })
    }
    if (e.key === '{') {
      getCursorPosition()
    } else {
      setShowVariableBox(false)
    }
    setKeyEvent(null)
    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (command) => {
    if (
      ['no-enter', 'no-tab', 'no-arrow'].includes(command) &&
      showVariableBox
    ) {
      return 'handled' // 阻止回车、Tab和方向键的默认行为
    }
    return 'not-handled' // 其他命令继续默认处理
  }

  useEffect(() => {
    if (cursorPos.x !== null && cursorPos.y !== null) {
      setShowVariableBox(true)
    }
  }, [cursorPos])

  useEffect(() => {
    handleGetCurrentCharacter()
  }, [positionKey])

  useEffect(() => {
    setMode(value?.prompt_type || 'simple')
    getInputValue(value?.prompt_type || 'simple')
  }, [value])

  useEffect(() => {
    if (inputValue) {
      const newEditorState = EditorState.createWithContent(
        ContentState.createFromText(inputValue)
      )
      setEditorState(newEditorState)
    }
  }, [inputValue])

  const renderPromptChangeBtn = () => {
    if (mode === 'simple') {
      return (
        <div
          className="flex items-center h-6 px-2 shadow-xs  rounded-lg text-[#133EBF] text-xs font-semibold cursor-pointer space-x-1"
          onClick={toggleMode}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8V9C3 10.1046 3.89543 11 5 11H13L11 13"
              stroke="#133EBF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 8V7C13 5.89543 12.1046 5 11 5H3L5 3"
              stroke="#133EBF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-xs font-semibold uppercase">
            {t('Switch to Advanced Mode')}
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        <div
          className="flex items-center h-6 px-2 shadow-xs  rounded-lg text-[#133EBF] text-xs font-semibold cursor-pointer space-x-1"
          onClick={() => {
            Modal.confirm({
              content: t(
                'Switching to simple mode will result in the loss of the current edited content'
              ),
              onConfirm: toggleMode,
              cancelText: t('Cancel'),
              okText: t('OK'),
            })
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8V9C3 10.1046 3.89543 11 5 11H13L11 13"
              stroke="#133EBF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 8V7C13 5.89543 12.1046 5 11 5H3L5 3"
              stroke="#133EBF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-xs font-semibold uppercase">
            {t('switch to Simple Mode')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-[1px] box-border rounded-lg bg-[#EBEBEB]">
      <div className="rounded-lg bg-[#EEF4FF] overflow-hidden">
        <div className="flex justify-between items-center h-11 px-4 font-500">
          <div className="h2 text-gray-850 font-600">
            {t(PROMPT_TYPE[mode])}
          </div>
          <div className="flex items-center h-[14px] space-x-1 text-xs">
            {renderPromptChangeBtn()}
          </div>
        </div>
        <div className="relative">
          <div
            ref={promptRef}
            className="px-4 pt-2 min-h-[228px] bg-white rounded-t-xl text-sm text-gray-700 overflow-y-auto h-[228px]"
            onScroll={() => handleGetCurrentCharacter()}
          >
            <div className="relative h-full z-[11]">
              <div
                className="h-full"
                onBlur={() => {
                  handleChangePrePrompt()
                  onChange(value)
                  searchVariable()
                }}
                onClick={() => {
                  editorRef.current?.focus()
                  handleGetCurrentCharacter()
                }}
              >
                <PluginEditor
                  placeholder={t(
                    "Write your prompt words here. You can insert form variables such as {{input}}. Enter '{' to insert a variable."
                  )}
                  ref={textareaRef}
                  editorState={editorState}
                  onChange={(e) => {
                    setEditorState(e)
                  }}
                  keyBindingFn={keyBindingFn}
                  plugins={[TagDecoratorPlugin]}
                  handleKeyCommand={handleKeyCommand}
                />
              </div>
              {showVariableBox && (
                <SetVariableBox
                  keyEvent={keyEvent}
                  position={cursorPos}
                  insetVarial={(v) => insertText(`{${v}}}`)}
                  value={value}
                  addTool={addTool}
                  addVariable={addVariable}
                  addKnowledge={addKnowledge}
                  selectedList={selectedList}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <AddVariableNotice
        variableList={variableList}
        setShowVariableNotice={setShowVariableNotice}
        showVariableNotice={showVariableNotice}
      />
    </div>
  )
}

export default PromptItem
