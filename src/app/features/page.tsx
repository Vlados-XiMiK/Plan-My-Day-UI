import type { Metadata } from "next"
import FeaturesPage from "@/components/features/features-page"

export const metadata: Metadata = {
  title: "Features - Plan My Day",
  description: "Discover the powerful features of Plan My Day - Your smart task management solution",
}

export default function Features() {
  return <FeaturesPage />
}

