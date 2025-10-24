function DataFileIcon({className = '', color}) {
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
        d="M2.45837 8.00016C2.45837 11.0607 4.43942 13.5 7.5 13.5V8.54167C7.5 8.00016 8 7.5 8.54167 7.5H13.5C13.5 4.43942 11.0606 2.4585 8.00004 2.4585C4.93947 2.4585 2.45837 4.93959 2.45837 8.00016Z"
        stroke={color}
        strokeWidth="1.23"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.25 9.75H9.75V13.25H13.25V9.75Z"
        stroke={color}
        strokeWidth="1.23"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default DataFileIcon
