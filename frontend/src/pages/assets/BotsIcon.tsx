import React from 'react'

function BotsIcon({className = ''}) {
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
      <rect
        x="4.50195"
        y="7.5"
        width="15"
        height="13"
        rx="3"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12.002 6.99951V3.99951"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.00195 12.5005V14.0005"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15.002 12.5005V14.0005"
        // stroke="#575759"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12.002" cy="4.00049" r="2" />
      <path
        d="M2.5 13C2.5 12.4477 2.94772 12 3.5 12H5V16H3.5C2.94772 16 2.5 15.5523 2.5 15V13Z"
        // fill="#575759"
      />
      <path
        d="M21.5 13C21.5 12.4477 21.0523 12 20.5 12H19V16H20.5C21.0523 16 21.5 15.5523 21.5 15V13Z"
        // fill="#575759"
      />
    </svg>
  )
}

export default BotsIcon
