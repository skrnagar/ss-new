
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feed | Safety Shaper",
  description: "Your professional feed for ESG and EHS updates",
}

export default function FeedLayout({
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
