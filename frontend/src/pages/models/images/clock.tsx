function Clock({className}) {
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
        d="M5.5 4.25V6.75H7.5"
        stroke="#AEAFB3"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Clock
