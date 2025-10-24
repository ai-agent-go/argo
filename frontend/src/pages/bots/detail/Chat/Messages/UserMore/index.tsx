import {Message, Popconfirm, Tooltip} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

import {clipboard} from '~/utils/clipboard'

import copyIcon from '../assets/copy.svg'
import deleteIcon from '../assets/delete.svg'
import editIcon from '../assets/edit.svg'
import replayIcon from '../assets/re-play.svg'

function UserMore({
  visible = true,
  deleteHandler,
  chat,
  handleEdit,
  handleRegen,
}) {
  const {t} = useTranslation()
  if (!visible) return null

  return (
    <div className="hidden group-hover:flex hover:flex absolute p-[2px] items-center gap-[3px] bottom-0 right-5 bg-white rounded-[6px]">
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
      <div
        onClick={async () => {
          await clipboard(chat.query)
          Message.success(t('Copy successfully'))
        }}
        className="shrink-0 w-[26px] h-[26px] cursor-pointer"
      >
        <Tooltip content={t('Copy as Plain Text')}>
          <img src={copyIcon} alt="" />
        </Tooltip>
      </div>
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
      <div className="shrink-0 w-[26px] h-[26px] cursor-pointer">
        <Popconfirm
          title={t('Confirm your action')}
          content={t('This action cannot be undone. Do you wish to continue?')}
          onOk={() => {
            deleteHandler('query')
          }}
          cancelText={t('Cancel')}
          okText={t('OK')}
        >
          <Tooltip content={t('Delete')}>
            <img src={deleteIcon} alt="" />
          </Tooltip>
        </Popconfirm>
      </div>
    </div>
  )
}

export default UserMore
