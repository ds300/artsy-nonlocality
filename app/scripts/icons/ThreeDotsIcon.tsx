import React from "react"

export const ThreeDotsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="-5 0 13 13" width={13} height={13} fill="none" {...props}>
    <circle cx={1.5} cy={11.5} r={1.5} fill="#C4C4C4" />
    <circle cx={1.5} cy={6.5} r={1.5} fill="#C4C4C4" />
    <circle cx={1.5} cy={1.5} r={1.5} fill="#C4C4C4" />
  </svg>
)
