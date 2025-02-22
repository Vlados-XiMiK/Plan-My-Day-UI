import type { Metadata } from "next"
import TermsContent from "@/components/legal/terms-content"

export const metadata: Metadata = {
  title: "Terms of Service - Plan My Day",
  description: "Terms of Service for Plan My Day application",
}

export default function TermsPage() {
  return <TermsContent />
}

