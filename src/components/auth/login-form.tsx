"use client"

import { useState, useEffect } from "react"
import { motion, MotionProps } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/shared/icons"
import { Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import type React from "react"
import { HTMLAttributes } from "react"
import { useNotification } from "@/contexts/notification-context"
import Cookies from "js-cookie"
import { loginUser, isAuthenticated } from "@/api/auth"
// import { AxiosError } from "axios" 
import axios from "axios" 

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>
type MotionPProps = MotionProps & HTMLAttributes<HTMLParagraphElement>

interface FormErrors {
  email?: string
  password?: string
}

// Interface for the error response structure
// interface ErrorResponse {
//  detail?: string
// }

export default function LoginForm() {
  const { t: tAuth } = useTranslation("auth")
  const { t: tNotifications } = useTranslation("notifications")
  const { addNotification } = useNotification()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const checkIfAuth = async () => {
      const auth = await isAuthenticated()
      if (auth) {
        router.replace("/dashboard")
      }
    }

    checkIfAuth()

    const registeredEmail = Cookies.get("registeredEmail")
    if (registeredEmail && /^\S+@\S+\.\S+$/.test(registeredEmail)) {
      setFormData((prev) => ({ ...prev, email: registeredEmail }))
      Cookies.remove("registeredEmail")
    }
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = `${tAuth("login.email")} ${tAuth("register.required")}`
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = tAuth("register.invalidEmail")
    }

    if (!formData.password) {
      newErrors.password = `${tAuth("login.password")} ${tAuth("register.required")}`
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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      await loginUser({
        email: formData.email,
        password: formData.password,
      })

      addNotification("success", tNotifications("welcome"), tNotifications("loginSuccess"), 3000)
      router.push("/dashboard")
    } catch (error: unknown) { 
      if (axios.isAxiosError(error)) {
        // const axiosError = error as AxiosError<ErrorResponse>
        // console.error("Login error:", axiosError.response?.data || axiosError.message)
        setErrors({ password: tAuth("login.invalidCredentials") })
      } else {
        // console.error("Login error:", error)
        setErrors({ password: tAuth("login.invalidCredentials") })
      }
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
      {...({} as MotionDivProps)}
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{tAuth("login.title")}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{tAuth("login.subtitle")}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-200">
            {tAuth("login.email")}
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
              {...({} as MotionPProps)}
            >
              {errors.email}
            </motion.p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-200">
            {tAuth("login.password")}
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
              {...({} as MotionPProps)}
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
          {tAuth("login.signIn")}
        </Button>
      </form>
      <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
        {tAuth("login.noAccount")}{" "}
        <Link
          href="/auth/register"
          className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
        >
          {tAuth("login.signUp")}
        </Link>
      </div>
    </motion.div>
  )
}