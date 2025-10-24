function InstallIcon({color = '#EBEBEB'}) {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_183_93)">
        <circle cx="8" cy="8.5" r="5.5" stroke={color} strokeWidth="5" />
      </g>
      <defs>
        <clipPath id="clip0_183_93">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default InstallIcon
