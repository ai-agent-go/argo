import React from 'react'

function MoreIcon({className = ''}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.4998 7L6.99983 10.5L3.49983 7"
        stroke="#565759"
        strokeWidth="1.1375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4998 3.5L6.99983 7L3.49983 3.5"
        stroke="#565759"
        strokeWidth="1.1375"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default MoreIcon
