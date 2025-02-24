import type { Metadata } from "next"
import Profile from "@/components/main/Profile"

export const metadata: Metadata = {
  title: "My Profile - Plan My Day",
  description: "Manage your Plan My Day profile, update settings, and view your personal task history, productivity details, and account information.",
}

export default function ProfileView() {
  return <Profile />
}

