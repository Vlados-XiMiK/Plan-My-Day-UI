"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/shared/icons"
import { FaTelegram, FaGoogle, FaDiscord, FaGithub } from "react-icons/fa"
import { Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"
import type React from "react"

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  const socialLogins = [
    { name: "Telegram", icon: FaTelegram, color: "bg-cyan-600 hover:bg-cyan-700" },
    { name: "Gmail", icon: FaGoogle, color: "bg-red-600 hover:bg-red-700" },
    { name: "Discord", icon: FaDiscord, color: "bg-indigo-600 hover:bg-indigo-700" },
    { name: "GitHub", icon: FaGithub, color: "bg-gray-800 hover:bg-gray-900" },
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = `${t.auth.login.email} ${t.auth.register.required}`
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.auth.register.invalidEmail
    }

    if (!formData.password) {
      newErrors.password = `${t.auth.login.password} ${t.auth.register.required}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>&'"]/g, "")
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    const sanitizedEmail = sanitizeInput(formData.email)
    const sanitizedPassword = sanitizeInput(formData.password)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      setErrors({ password: t.auth.login.invalidCredentials })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white dark:bg-[#16213e] rounded-lg shadow-lg p-8"
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{t.auth.login.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t.auth.login.subtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-200">
            {t.auth.login.email}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
            autoComplete="off"
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-500 mt-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/50 rounded-md p-2"
            >
              {errors.email}
            </motion.p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-200">
            {t.auth.login.password}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pr-10 text-sm"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-500 mt-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/50 rounded-md p-2"
            >
              {errors.password}
            </motion.p>
          )}
        </div>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 text-sm"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t.auth.login.signIn}
        </Button>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#16213e] px-2 text-gray-500 dark:text-gray-400">
              {t.auth.login.orContinueWith}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {socialLogins.map((login) => (
            <Button
              key={login.name}
              variant="outline"
              type="button"
              className={`${login.color} text-white border-0 text-xs py-1`}
            >
              <login.icon className="mr-2 h-3 w-3" />
              {login.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
        {t.auth.login.noAccount}{" "}
        <Link
          href="/auth/register"
          className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
        >
          {t.auth.login.signUp}
        </Link>
      </div>
    </motion.div>
  )
}

