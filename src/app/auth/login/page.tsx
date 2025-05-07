import type { Metadata } from "next"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login - Plan My Day",
  description: "Login to your Plan My Day account",
}

export default function LoginPage() {
  return <LoginForm />
}

