
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Safety Shaper",
  description: "Your professional profile on Safety Shaper",
}

export default function ProfileLayout({
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
