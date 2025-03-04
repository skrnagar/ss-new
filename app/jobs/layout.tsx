
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jobs | Safety Shaper",
  description: "ESG and EHS job opportunities",
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-6 md:py-10">
      {children}
    </div>
  )
}
