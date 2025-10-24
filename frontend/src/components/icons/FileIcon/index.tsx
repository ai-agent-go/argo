import React from 'react'

function FileIcon({strokeWidth = '1.5', className = 'w-[36px] h-[36px]'}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 48 48"
      width={36}
      height={36}
      strokeWidth={strokeWidth}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m26 33 5-6v6h-5Zm0 0-3-4-4 4h7Zm11 9H11a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h21l7 7v27a2 2 0 0 1-2 2ZM17 19h1v1h-1v-1Z"
      />
    </svg>
  )
}

export default FileIcon
