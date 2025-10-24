import {Input} from '@arco-design/web-react'
import {useRef, useState} from 'react'

export default function MultiLinePlaceholderTextArea({
  placeholder,
  className = '',
  onChange,
  value,
}) {
  const [input, setInput] = useState(false)
  const inputRef = useRef(null)

  return (
    <div className="relative">
      <Input.TextArea
        value={value}
        ref={inputRef}
        onBlur={() => setInput(false)}
        className={className}
        onChange={(e) => {
          onChange(e)
        }}
      />
      {!value && !input && (
        <div
          onClick={() => {
            inputRef.current.focus()
            setInput(true)
          }}
          className="absolute top-3 left-[14px] h-full overflow-auto text-[#888] text-sm"
          style={{
            whiteSpace: 'pre-wrap',
            maxHeight: 'calc(100% - 24px)',
            overflow: 'hidden',
            width: 'calc(100% - 28px)',
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}
