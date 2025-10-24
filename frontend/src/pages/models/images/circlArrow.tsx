function CircleArrow({className}) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="5.99951"
        cy="6"
        r="4"
        stroke="#AEAFB3"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M6 4.25V7.75M6 7.75L4.5 6.25M6 7.75L7.5 6.25"
        stroke="#AEAFB3"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default CircleArrow
