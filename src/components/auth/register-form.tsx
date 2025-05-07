"use client"

import { useState } from "react"
import { motion, MotionProps } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/shared/icons"
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import type React from "react"
import { HTMLAttributes } from "react"
import { useNotification } from "@/contexts/notification-context"
import Cookies from "js-cookie"
import { registerUser } from "@/api/auth"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

// type for motion.p
type MotionPProps = MotionProps & HTMLAttributes<HTMLParagraphElement>

interface FormData {
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

const steps = [
  {
    title: "Account Details",
    fields: ["email"],
  },
  {
    title: "Security",
    fields: ["password", "confirmPassword"],
  },
]

export default function RegisterForm() {
  const { t: tAuth } = useTranslation("auth")
  const { t: tNotifications } = useTranslation("notifications")
  const { addNotification } = useNotification()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}
    const currentFields = steps[step].fields

    currentFields.forEach((field) => {
      switch (field) {
        case "email":
          if (!formData.email) {
            newErrors.email = `${tAuth("register.email")} ${tAuth("register.required")}`
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = tAuth("register.invalidEmail")
          } else if (formData.email.length > 255) {
            newErrors.email = tAuth("register.emailTooLong")
          } else if (!/^[a-zA-Z0-9@._-]+$/.test(formData.email)) {
            newErrors.email = tAuth("register.invalidEmail")
          }
          break
        case "password":
          if (!formData.password) {
            newErrors.password = `${tAuth("register.password")} ${tAuth("register.required")}`
          } else if (formData.password.length < 8) {
            newErrors.password = tAuth("register.passwordTooShort")
          } else if (formData.password.length > 100) {
            newErrors.password = tAuth("register.passwordTooLong")
          } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
            newErrors.password = tAuth("register.passwordRequirements")
          }
          break
        case "confirmPassword":
          if (!formData.confirmPassword) {
            newErrors.confirmPassword = `${tAuth("register.confirmPassword")} ${tAuth("register.required")}`
          } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = tAuth("register.passwordsMismatch")
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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateStep()) return

    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)

    try {
      const response = await registerUser({
        email: formData.email,
        password: formData.password,
      })
      Cookies.set("registeredEmail", response.email, { expires: 1 / 24, sameSite: "strict" })
      addNotification("success", tNotifications("welcome"), tNotifications("registerSuccess"), 3000)
      router.push("/auth/login")
    } catch (error: any) {
      const fieldErrors: FormErrors = {}
      const errorField = error.cause?.field
      const errorMessage = error.message

      if (errorField === "email") {
        fieldErrors.email = errorMessage.includes("unique") ? tAuth("register.emailExists") : errorMessage
        setStep(0)
        addNotification("error", tNotifications("invalidInput.title"), fieldErrors.email || "", 4000)
      } else if (errorField === "password") {
        fieldErrors.password = errorMessage
        setStep(1)
        addNotification("error", tNotifications("invalidInput.title"), fieldErrors.password || "", 4000)
      } else {
        addNotification("error", tNotifications("invalidInput.title"), errorMessage, 4000)
      }

      setErrors(fieldErrors)
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
      {...({} as MotionDivProps)}
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{tAuth("register.title")}</h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">{tAuth("register.subtitle")}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                {tAuth("register.email")}
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
          )}

          {step === 1 && (
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700 dark:text-gray-200">
                  {tAuth("register.password")}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700 dark:text-gray-200">
                  {tAuth("register.confirmPassword")}
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
                    {...({} as MotionPProps)}
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
              {tAuth("register.back")}
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
            {step === steps.length - 1 ? tAuth("register.createAccount") : tAuth("register.next")}
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
              <div className="relative flex justify-center text-xs uppercase"></div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
            {tAuth("register.haveAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {tAuth("register.signIn")}
            </Link>
          </div>
        </>
      )}
    </motion.div>
  )
}