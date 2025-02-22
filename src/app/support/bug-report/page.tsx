import type { Metadata } from "next"
import BugReportForm from "@/components/support/bug-report-form"

export const metadata: Metadata = {
  title: "Report a Bug - Plan My Day",
  description: "Report a bug or issue with Plan My Day",
}

export default function BugReportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BugReportForm />
    </div>
  )
}

