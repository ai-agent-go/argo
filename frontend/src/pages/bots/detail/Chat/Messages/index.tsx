import React, {useState} from 'react'
import ReactDOM from 'react-dom'

import ResponseMessage from '~/components/chat/Messages/ResponseMessage'
import PromptLog from '~/pages/bots/components/PromptLog'

import MessageItem from './MessageItem'

function Messages({
  chatList,
  detail,
  prologue = '',
  checkVariable,
  handleClickExtraItem,
  conversationId,
  interruptEvent,
  setInterruptEvent,
  taskContent,
  handleSubmit,
}) {
  const [visible, setVisible] = useState(false)
  const [messageId, setMessageId] = useState('')
  return (
    <>
      {prologue ? (
        <div className="flex flex-col justify-between px-5 mb-3 mx-auto rounded-lg group relative">
          <ResponseMessage
            taskContent={taskContent}
            setInterruptEvent={setInterruptEvent}
            interruptEvent={interruptEvent}
            message={{answer: prologue}}
            detail={detail}
            nameColor={detail.background_img ? '#F2F2F2' : '#AEAFB3'}
          />
        </div>
      ) : null}

      {chatList.map((chat, idx) => (
        <MessageItem
          taskContent={taskContent}
          handleSubmit={handleSubmit}
          interruptEvent={interruptEvent}
          key={chat.id}
          chat={chat}
          detail={detail}
          isLastItem={idx === chatList.length - 1}
          checkVariable={checkVariable}
          conversationId={conversationId}
          handlePromptLog={() => {
            setMessageId(chat.id)
            setVisible(true)
          }}
          // loading={loading}
          // setLoading={setLoading}
          handleClickExtraItem={handleClickExtraItem}
        />
      ))}
      {ReactDOM.createPortal(
        <PromptLog
          visible={visible}
          onClose={() => {
            setMessageId('')
            setVisible(false)
          }}
          messageId={messageId}
        />,
        document.body
      )}
    </>
  )
}

export default React.memo(Messages)
