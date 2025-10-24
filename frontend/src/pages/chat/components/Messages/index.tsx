import React from 'react'

import ResponseMessage from '~/components/chat/Messages/ResponseMessage'

import MessageItem from './MessageItem'

function Messages({
  chatList,
  detail,
  prologue = '',
  checkVariable,
  playAudioLipSync,
  initAudio,
  // loading,
  // setLoading,
  refresh,
  handleClickExtraItem,
  interruptEvent,
  handleSubmit,
  setInterruptEvent,
  taskContent,
}) {
  return (
    <>
      {prologue ? (
        <div className="flex flex-col justify-between px-5 mb-3 max-w-5xl mx-auto rounded-lg group relative">
          <ResponseMessage
            taskContent={taskContent}
            setInterruptEvent={setInterruptEvent}
            interruptEvent={interruptEvent}
            message={{answer: prologue}}
            detail={detail}
            handleSubmit={handleSubmit}
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
          refresh={refresh}
          playAudioLipSync={playAudioLipSync}
          initAudio={initAudio}
          // loading={loading}
          // setLoading={setLoading}
          handleClickExtraItem={handleClickExtraItem}
        />
      ))}
    </>
  )
}

export default React.memo(Messages)
