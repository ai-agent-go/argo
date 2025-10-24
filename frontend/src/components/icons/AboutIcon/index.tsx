function AboutIcon({className = '', color}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.20801 5.08268L8.29134 2.16602V13.8327H4.20801V5.08268Z"
        stroke={color}
        strokeWidth="1.225"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.29199 4.79102L12.3753 7.70768V13.8327"
        stroke={color}
        strokeWidth="1.225"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.16699 13.834H13.8337"
        stroke={color}
        strokeWidth="1.225"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default AboutIcon
