import React from 'react'

function NumberIcon({className = ''}) {
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
        d="M5.99902 11.334H25.999"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99902 20.668H25.999"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99902 26.002L12.6657 6.00195"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.332 26.002L21.9987 6.00195"
        // stroke="#565759"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default NumberIcon
