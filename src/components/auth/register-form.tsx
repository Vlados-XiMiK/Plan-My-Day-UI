"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/shared/icons"
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"
import { FaTelegram, FaGoogle, FaDiscord, FaGithub } from "react-icons/fa"
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"
import type React from "react"

interface FormData {
  email: string
  name: string
  username: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  name?: string
  username?: string
  password?: string
  confirmPassword?: string
}

const steps = [
  {
    title: "Account Details",
    fields: ["email"],
  },
  {
    title: "Personal Information",
    fields: ["name", "username"],
  },
  {
    title: "Security",
    fields: ["password", "confirmPassword"],
  },
]

export default function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  const socialLogins = [
    { name: "Telegram", icon: FaTelegram, color: "bg-purple-600 hover:bg-purple-700" },
    { name: "Gmail", icon: FaGoogle, color: "bg-red-600 hover:bg-red-700" },
    { name: "Discord", icon: FaDiscord, color: "bg-indigo-600 hover:bg-indigo-700" },
    { name: "GitHub", icon: FaGithub, color: "bg-gray-800 hover:bg-gray-900" },
  ]

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}
    const currentFields = steps[step].fields

    currentFields.forEach((field) => {
      switch (field) {
        case "email":
          if (!formData.email) {
            newErrors.email = t.auth.register.email + " " + t.auth.register.required
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t.auth.register.invalidEmail
          } else if (formData.email.length > 255) {
            newErrors.email = t.auth.register.emailTooLong
          }
          break
        case "name":
          if (!formData.name) {
            newErrors.name = t.auth.register.name + " " + t.auth.register.required
          } else if (formData.name.length < 2) {
            newErrors.name = t.auth.register.nameTooShort
          } else if (formData.name.length > 50) {
            newErrors.name = t.auth.register.nameTooLong
          } else if (!/^[a-zA-Z\s]*$/.test(formData.name)) {
            newErrors.name = t.auth.register.nameInvalid
          }
          break
        case "username":
          if (!formData.username) {
            newErrors.username = t.auth.register.username + " " + t.auth.register.required
          } else if (formData.username.length < 3) {
            newErrors.username = t.auth.register.usernameTooShort
          } else if (formData.username.length > 30) {
            newErrors.username = t.auth.register.usernameTooLong
          } else if (!/^[a-zA-Z0-9_]*$/.test(formData.username)) {
            newErrors.username = t.auth.register.usernameInvalid
          }
          break
        case "password":
          if (!formData.password) {
            newErrors.password = t.auth.register.password + " " + t.auth.register.required
          } else if (formData.password.length < 8) {
            newErrors.password = t.auth.register.passwordTooShort
          } else if (formData.password.length > 100) {
            newErrors.password = t.auth.register.passwordTooLong
          } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
            newErrors.password = t.auth.register.passwordRequirements
          }
          break
        case "confirmPassword":
          if (!formData.confirmPassword) {
            newErrors.confirmPassword = t.auth.register.confirmPassword + " " + t.auth.register.required
          } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = t.auth.register.passwordsMismatch
          }
          break
      }
    })

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
    if (!validateStep()) {
      return
    }

    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)

    const sanitizedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key as keyof FormData] = sanitizeInput(value)
      return acc
    }, {} as FormData)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      setErrors({ password: t.auth.register.registrationFailed })
    } finally {
      setIsLoading(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#16213e] p-8 rounded-lg shadow-lg relative z-10"
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{t.auth.register.title}</h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">{t.auth.register.subtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700 dark:text-gray-200">
                {t.auth.register.email}
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
          )}

          {step === 1 && (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-700 dark:text-gray-200">
                  {t.auth.register.name}
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t.auth.register.namePlaceholder}
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-500 mt-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/50 rounded-md p-2"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-gray-700 dark:text-gray-200">
                  {t.auth.register.username}
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={t.auth.register.usernamePlaceholder}
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
                />
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-500 mt-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/50 rounded-md p-2"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-200">
                  {t.auth.register.password}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700 dark:text-gray-200">
                  {t.auth.register.confirmPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="bg-gray-50 dark:bg-[#1a1a2e] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pr-10 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-500 mt-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/50 rounded-md p-2"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex justify-between">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
              className="bg-gray-50 dark:bg-[#1a1a2e] text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#16213e] text-xs py-1"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              {t.auth.register.back}
            </Button>
          )}
          <Button
            type="submit"
            className={`${
              step === 0 ? "w-full" : ""
            } bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 text-xs py-1`}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />}
            {step === steps.length - 1 ? t.auth.register.createAccount : t.auth.register.next}
            {step < steps.length - 1 && <ArrowRight className="ml-2 h-3 w-3" />}
          </Button>
        </div>
      </form>
      {step === 0 && (
        <>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#16213e] px-2 text-gray-500 dark:text-gray-400">
                  {t.auth.register.orContinueWith}
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
            {t.auth.register.haveAccount}{" "}
            <Link
              href="/auth/login"
              className="text-purple-600 hover:text:purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {t.auth.register.signIn}
            </Link>
          </div>
        </>
      )}
    </motion.div>
  )
}

