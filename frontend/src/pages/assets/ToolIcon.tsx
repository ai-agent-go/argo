import React from 'react'

function ToolIcon({className = ''}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 10C4 8.34315 5.34315 7 7 7H17C18.6569 7 20 8.34315 20 10V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V10Z"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 7V6C16 4.89543 15.1046 4 14 4H10C8.89543 4 8 4.89543 8 6V7"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.5 12V14C14.5 14.5523 14.0523 15 13.5 15H10.5C9.94772 15 9.5 14.5523 9.5 14V12"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 12H20"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default ToolIcon
