import React from 'react'

function DropdownIcon({className = ''}) {
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
      <path
        d="M26.667 10.668V22.668C26.667 24.8771 24.8761 26.668 22.667 26.668H10.667"
        // stroke="#565759"
        strokeWidth="2.13333"
        strokeLinecap="round"
      />
      <rect
        x="5.33301"
        y="5.33398"
        width="17.3333"
        height="17.3333"
        rx="4"
        // stroke="#565759"
        strokeWidth="2.13333"
        strokeLinecap="round"
      />
      <path
        d="M10.667 13.3333L13.3337 16L17.3337 12"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default DropdownIcon
