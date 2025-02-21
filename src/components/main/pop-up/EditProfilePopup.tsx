'use client'

import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { useState, useRef } from 'react'
import { X, User, Mail, Cake, Building2, Phone, ImageIcon, Upload } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { InputHTMLAttributes, HTMLAttributes, ButtonHTMLAttributes } from 'react'

// type for motion.input
type MotionInputProps = MotionProps & InputHTMLAttributes<HTMLInputElement>

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

// type for motion.button
type MotionButtonProps = MotionProps & ButtonHTMLAttributes<HTMLButtonElement>

// type for motion.h2
type MotionH2Props = MotionProps & HTMLAttributes<HTMLHeadingElement>

interface EditProfilePopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function EditProfilePopup({ isOpen, onClose }: EditProfilePopupProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    placeOfWork: '',
    phoneNumber: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notificationShown, setNotificationShown] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addNotification } = useNotification()

  const validateField = (name: string, value: string) => {
    let error = ''
    const containsCyrillic = /[а-яА-ЯёЁ]/.test(value)

    if (containsCyrillic) {
      error = 'Only Latin characters are allowed.'
    } else {
      switch (name) {
        case 'username':
          if (!value.trim()) error = 'Username is required.'
          break
        case 'email':
          if (!value.trim()) error = 'Email is required.'
          else if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email format.'
          break
        case 'age':
          if (value.trim() && (isNaN(Number(value)) || Number(value) <= 0)) {
            error = 'Age must be a positive number.'
          }
          break
        case 'phoneNumber':
          if (value.trim() && (!/^\+?[0-9\s-]{0,15}$/.test(value))) {
            error = 'Phone number must contain only digits, spaces, "+" or "-".'
          } else if (value.trim() && value.replace(/[^0-9]/g, '').length > 15) {
            error = 'Invalid phone number (max 15 digits).'
          }
          break
      }
    }

    return error
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value)
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    const error = validateField(name, value)

    if (name === 'phoneNumber' && value.replace(/[^0-9]/g, '').length > 15) {
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: error }))

    if (error && !notificationShown) {
      addNotification('error', error)
      setNotificationShown(true)
    } else if (!error) {
      setNotificationShown(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) {
      addNotification('error', 'Please fix validation errors.')
      return
    }

    try {
      addNotification('info', 'Updating profile...')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      addNotification('success', 'Profile updated successfully!')
      onClose()
    } catch {
      addNotification('error', 'Failed to update profile. Please try again.')
    }
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 10 } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
          {...({} as MotionDivProps)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-xl relative overflow-hidden"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            {...({} as MotionDivProps)}
          >
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <motion.h2
                  className="text-2xl font-semibold text-gray-800"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  {...({} as MotionH2Props)}
                >
                  Update Profile
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  {...({} as MotionButtonProps)}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {[
                  { icon: User, label: 'Username', name: 'username', type: 'text', placeholder: 'Enter username' },
                  { icon: Mail, label: 'Email', name: 'email', type: 'email', placeholder: 'Enter email' },
                  { icon: Cake, label: 'Age', name: 'age', type: 'number', placeholder: 'Enter age' },
                  { icon: Building2, label: 'Place of Work', name: 'placeOfWork', type: 'text', placeholder: 'Enter workplace' },
                  { icon: Phone, label: 'Phone Number', name: 'phoneNumber', type: 'text', placeholder: 'Enter phone number' }
                ].map(({ icon: Icon, label, name, type, placeholder }) => (
                  <div key={name} className="relative">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                        <Icon className="h-5 w-5 bg-white p-0.5 rounded-full" />
                      </div>
                      <motion.input
                        type={type}
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        whileFocus="focus"
                        variants={inputVariants}
                        maxLength={name === 'phoneNumber' ? 15 : undefined}
                        className={`w-full pl-10 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-800 bg-white ${
                          errors[name] ? 'border-red-500' : 'border-gray-200'
                        }`}
                        {...({} as MotionInputProps)}
                      />
                    </div>
                    {errors[name] && <span className="text-red-500 text-xs mt-1 block">{errors[name]}</span>}
                  </div>
                ))}

                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Profile Picture (Optional)</label>
                  <div className="mt-1 flex items-center gap-4">
                    {image ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      {...({} as MotionButtonProps)}
                    >
                      <Upload className="h-4 w-4 inline-block mr-2" />
                      Upload
                    </motion.button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 text-sm rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-300 w-full sm:w-auto"
                    {...({} as MotionButtonProps)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 text-sm rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 w-full sm:w-auto"
                    {...({} as MotionButtonProps)}
                  >
                    Update Profile
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}