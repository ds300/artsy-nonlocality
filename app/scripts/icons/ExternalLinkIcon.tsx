import React from "react"

export const ExternalLinkIcon = ({
  fill = "#545454",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 11 11" width={11} height={11} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.727 1.6a.6.6 0 0 1 0-1.2H10a.6.6 0 0 1 .6.6v3.273a.6.6 0 1 1-1.2 0V2.448L3.879 7.97a.6.6 0 1 1-.849-.849L8.551 1.6H6.727zM.4 3.454a.6.6 0 0 1 .6-.6h4.09a.6.6 0 0 1 0 1.2H1.6V9.4h5.345V5.909a.6.6 0 0 1 1.2 0v4.09a.6.6 0 0 1-.6.6H1a.6.6 0 0 1-.6-.6V3.455z"
      fill={fill}
    />
  </svg>
)
