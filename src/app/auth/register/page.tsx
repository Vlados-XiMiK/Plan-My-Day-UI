import type { Metadata } from "next"
import RegisterForm from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register - Plan My Day",
  description: "Create your Plan My Day account",
}

export default function RegisterPage() {
  return <RegisterForm />
}

