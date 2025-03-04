
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Groups | Safety Shaper",
  description: "Community groups for ESG and EHS professionals",
}

export default function GroupsLayout({
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
