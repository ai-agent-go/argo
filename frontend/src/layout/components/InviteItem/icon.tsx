import React from 'react'

function InviteIcon({className = 'stroke-[#565759]'}) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2317_16571)">
        <path
          d="M15 19C20.5229 19 25 17.2092 25 15C25 12.7908 20.5229 11 15 11C9.47715 11 5 12.7908 5 15C5 17.2092 9.47715 19 15 19Z"
          // stroke="#565759"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 15C19 20.5229 17.2092 25 15 25C12.7908 25 11 20.5229 11 15C11 9.47715 12.7908 5 15 5C17.2092 5 19 9.47715 19 15Z"
          // stroke="#565759"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 25C20.5228 25 25 20.5228 25 15C25 9.47715 20.5228 5 15 5C9.47715 5 5 9.47715 5 15C5 20.5228 9.47715 25 15 25Z"
          // stroke="#565759"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2317_16571">
          <rect
            width="22"
            height="22"
            fill="white"
            transform="translate(4 4)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default InviteIcon
