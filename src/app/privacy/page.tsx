import type { Metadata } from "next"
import PrivacyContent from "@/components/legal/privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy - Plan My Day",
  description: "Privacy Policy for Plan My Day application",
}

export default function PrivacyPage() {
  return <PrivacyContent />
}

