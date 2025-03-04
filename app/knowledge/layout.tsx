
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Knowledge | Safety Shaper",
  description: "Knowledge resources for ESG and EHS professionals",
}

export default function KnowledgeLayout({
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
