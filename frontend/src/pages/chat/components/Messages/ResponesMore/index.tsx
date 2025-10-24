import {Message, Popconfirm, Tooltip} from '@arco-design/web-react'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import MoreDropdown from '~/components/MoreDropdown'
import {clipboard} from '~/utils/clipboard'

import copyIcon from '../assets/copy.svg'
import createIcon from '../assets/createnew.svg'
import deleteIcon from '../assets/delete.svg'
import editIcon from '../assets/edit.svg'
import markdownIcon from '../assets/markdown.svg'
import moreIcon from '../assets/more.svg'
import replayIcon from '../assets/re-play.svg'

function ResponseMore({
  visible = true,
  deleteHandler,
  chat,
  handleEdit,
  createBranch,
  handleRegen,
}) {
  const {t} = useTranslation()
  const [isPlan, setIsPlan] = useState(null)

  useEffect(() => {
    if (chat.agent_thoughts) {
      const plan = [...chat.agent_thoughts]
        .reverse()
        .find((item) => item?.metadata?.langgraph_node?.includes('planner'))
      setIsPlan(plan)
    }
  }, [chat])

  if (!visible) return null

  return (
    <div className="hidden group-hover:flex hover:flex absolute p-[2px] items-center gap-[3px] bottom-0 left-[66px] bg-white rounded-[6px]">
      <div className="shrink-0 w-[26px] h-[26px] cursor-pointer">
        <Popconfirm
          title={t('Confirm your action')}
          content={t('Regenerating will replace current message')}
          onOk={() => {
            handleRegen({message: chat.query})
          }}
          cancelText={t('Cancel')}
          okText={t('OK')}
        >
          <Tooltip content={t('Regenerate')}>
            <img src={replayIcon} alt="" />
          </Tooltip>
        </Popconfirm>
      </div>
      {!isPlan ? (
        <div
          onClick={async () => {
            const {agent_thoughts} = chat
            const elementsToCopy = []
            if (agent_thoughts && agent_thoughts.length > 0) {
              agent_thoughts
                .filter((v) => !v.tool_type && v.thought) // 筛选符合条件的 thoughts
                .forEach((thought) => {
                  const e = document.getElementById(thought.id)
                  if (e) elementsToCopy.push(e)
                })
            }

            if (elementsToCopy.length === 0) {
              const defaultElement = document.getElementById(chat.id)
              if (defaultElement) elementsToCopy.push(defaultElement)
            }

            // const element = document.getElementById(chat.id)
            if (elementsToCopy.length) {
              const removeThinkElements = (node) => {
                if (node.dataset.tag === 'think') {
                  node.remove()
                  return
                }
                if (node.dataset.tag === 'mermaid') {
                  node.remove()
                  return
                }
                // console.log(node.className)
                if (node.className === 'katex-mathml') {
                  node.remove()
                  return
                }
                Array.from(node.children).forEach((child) =>
                  removeThinkElements(child)
                )
              }

              let combinedText = ''
              elementsToCopy.forEach((element) => {
                const newElement = element.cloneNode(true) as HTMLElement
                removeThinkElements(newElement)
                combinedText += `${newElement.innerText}\n\n` // 用换行分隔不同 thoughts
              })

              await clipboard(combinedText.trim())
              Message.success(t('Copy successfully'))
            }
          }}
          className="shrink-0 w-[26px] h-[26px] cursor-pointer"
        >
          <Tooltip content={t('Copy as Plain Text')}>
            <img src={copyIcon} alt="" />
          </Tooltip>
        </div>
      ) : null}

      {!isPlan ? (
        <div
          onClick={() => {
            handleEdit()
          }}
          className="shrink-0 w-[26px] h-[26px] cursor-pointer"
        >
          <Tooltip content={t('Edit')}>
            <img src={editIcon} alt="" />
          </Tooltip>
        </div>
      ) : null}
      <div className="shrink-0 w-[26px] h-[26px] cursor-pointer">
        <Popconfirm
          title={t('Confirm your action')}
          content={t('This action cannot be undone. Do you wish to continue?')}
          onOk={() => {
            deleteHandler('answer')
          }}
          cancelText={t('Cancel')}
          okText={t('OK')}
        >
          <Tooltip content={t('Delete')}>
            <img src={deleteIcon} alt="" />
          </Tooltip>
        </Popconfirm>
      </div>
      {!isPlan ? (
        <MoreDropdown
          list={[
            {
              key: 'copy',
              item: (
                <div className="flex items-center justify-center gap-[5px]">
                  <img src={markdownIcon} alt="" />
                  {t('Copy as Markdown')}
                </div>
              ),
              onClick: async () => {
                const {agent_thoughts, answer} = chat
                let text = answer

                // 1. 筛选所有符合条件的 thoughts，并拼接它们的文本
                if (agent_thoughts?.length > 0) {
                  const validThoughts = agent_thoughts
                    .filter((v) => !v.tool_type && v.thought) // 筛选无 tool_type 且有 thought 的条目
                    .map((v) => v.thought) // 提取 thought 内容
                    .join('\n\n') // 用空行分隔不同 thoughts

                  // 如果有符合条件的 thoughts，则覆盖默认的 text
                  if (validThoughts) {
                    text = validThoughts
                  }
                }

                // 2. 移除 <think> 标签（全局匹配）
                text = text.replace(/<think>[\s\S]*?<\/think>/gi, '')
                await clipboard(text)
                Message.success(t('Copy successfully'))
              },
            },
            {
              key: 'branch',
              item: (
                <div className="flex items-center justify-center gap-[5px]">
                  <img src={createIcon} alt="" />
                  {t('Create Branch')}
                </div>
              ),
              onClick: () => {
                createBranch()
              },
            },
          ]}
          position="top"
        >
          <div className="shrink-0 w-[26px] h-[26px] cursor-pointer">
            <img src={moreIcon} alt="" />
          </div>
        </MoreDropdown>
      ) : null}
    </div>
  )
}

export default ResponseMore
