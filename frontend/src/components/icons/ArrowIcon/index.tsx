import React from 'react'

function ArrowIcon({className = 'shrink-0 w-[14px] h-[14px] text-gray-500'}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-icon="ChevronRight"
      aria-hidden="true"
    >
      <g id="chevron-right" role="none">
        <path
          id="Icon"
          d="M5.25 10.5L8.75 7L5.25 3.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="none"
        />
      </g>
    </svg>
  )
}

export default ArrowIcon
