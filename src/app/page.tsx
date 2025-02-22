import type { Metadata } from "next"
import LandingPage from "@/components/landing/landing-page"

export const metadata: Metadata = {
  title: "Plan My Day - Smart Task Management",
  description: "Organize your day effectively with Plan My Day - the smart task management app",
}

export default function Home() {
  return <LandingPage />
}

