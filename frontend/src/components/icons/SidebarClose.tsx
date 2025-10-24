export default function SidebarClose({className = 'stroke-[#565759]'}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="16"
        height="14"
        rx="3"
        transform="matrix(-1 0 0 1 20 5)"
        // stroke="#565759"
        // strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13.5 5V19"
        // stroke="#565759"
        // strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 8L17.5 9.5L16 11"
        // stroke="#565759"
        // strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
