import React from 'react'

function InterIcon({
  className = 'w-4 h-4 ml-3 mr-2 text-[#03060E]',
  color = '#03060E',
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1021_1375)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.6821 4.31802 14.6668 7.99992 14.6668Z"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.33325 8H14.6666"
          // stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.99992 14.6668C9.47269 14.6668 10.6666 11.6821 10.6666 8.00016C10.6666 4.31826 9.47269 1.3335 7.99992 1.3335C6.52715 1.3335 5.33325 4.31826 5.33325 8.00016C5.33325 11.6821 6.52715 14.6668 7.99992 14.6668Z"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.28589 3.38086C4.49232 4.58729 6.15899 5.33349 7.99992 5.33349C9.84089 5.33349 11.5076 4.58729 12.714 3.38086"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.714 12.6191C11.5076 11.4127 9.84089 10.6665 7.99992 10.6665C6.15899 10.6665 4.49232 11.4127 3.28589 12.6191"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1021_1375">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
export default InterIcon
