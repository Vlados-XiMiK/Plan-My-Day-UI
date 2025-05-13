import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories - Plan My Day",
  description: "View and manage your categories",
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}