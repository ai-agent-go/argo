import React from 'react'

function TextIcon({className = ''}) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5.33301"
        y="5.33398"
        width="21.3333"
        height="21.3333"
        rx="4"
        // stroke="#565759"
        strokeWidth="2.13333"
        strokeLinecap="round"
      />
      <path
        d="M10.666 21.3346L15.9993 10.668L21.3327 21.3346"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.666 17.334H19.3327"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TextIcon
