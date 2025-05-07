import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "My Profile - Plan My Day",
    description: "Manage your Plan My Day profile, update settings, and view your personal task history, productivity details, and account information.",
  }

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}