'use client'

import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import Image from "next/image";
import { useState, useRef, useEffect } from 'react'
import { X, User, Mail, Cake, Building2, Phone, ImageIcon, Upload } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { useUser } from '@/contexts/UserContext'
import { InputHTMLAttributes, HTMLAttributes, ButtonHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['popups', 'notifications'])
  const { user, updateUser } = useUser()
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

  // Initialize the form with user data when opening the popup
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        placeOfWork: user.place_of_work || '',
        phoneNumber: user.phone_number || ''
      })
    }
  }, [isOpen, user])

  // Check if changes have been made
  const hasChanges = () => {
    if (!user) return false;
    return (
      formData.username !== (user.username || '') ||
      formData.email !== (user.email || '') ||
      formData.age !== (user.age?.toString() || '') ||
      formData.placeOfWork !== (user.place_of_work || '') ||
      formData.phoneNumber !== (user.phone_number || '')
    )
  }

  const validateField = (name: string, value: string) => {
    let error = '';

    // Проверка на опасные символы для всех полей (кроме placeOfWork, где отдельная логика)
    const dangerousSymbols = /[<>"';`\\&%#|]/;
    if (name !== 'placeOfWork' && dangerousSymbols.test(value)) {
      return t('popups:edit_profile_popup.validation.dangerousSymbols');
    }

    // Проверка на кириллицу (запрещена для всех полей, кроме placeOfWork)
    const containsCyrillic = /[а-яА-ЯёЁ]/;
    if (name !== 'placeOfWork' && containsCyrillic.test(value)) {
      return t('popups:edit_profile_popup.validation.noCyrillic');
    }

    switch (name) {
      case 'username':
        if (!value.trim()) error = t('popups:edit_profile_popup.validation.usernameRequired');
        break;
      case 'email':
        if (!value.trim()) error = t('popups:edit_profile_popup.validation.emailRequired');
        else if (!/\S+@\S+\.\S+/.test(value)) error = t('popups:edit_profile_popup.validation.invalidEmail');
        break;
      case 'age':
        if (value.trim()) {
          const ageNum = Number(value);
          if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
            error = t('popups:edit_profile_popup.validation.invalidAge');
          } else if (ageNum < 8) {
            error = t('popups:edit_profile_popup.validation.ageTooLow');
          } else if (ageNum > 120) {
            error = t('popups:edit_profile_popup.validation.ageTooHigh');
          }
        }
        break;
      case 'placeOfWork':
        // Разрешены: латиница, кириллица, цифры, пробелы, дефисы, точки, запятые
        // Запрещены: опасные символы для SQL-инъекций и XSS
        const allowedPlaceOfWork = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,-]*$/;
        const forbiddenSymbols = /[<>";'`\\\/*&#%|=]/;
        if (value.trim() && !allowedPlaceOfWork.test(value)) {
          error = t('popups:edit_profile_popup.validation.invalidPlaceOfWorkChars');
        } else if (value.trim() && forbiddenSymbols.test(value)) {
          error = t('popups:edit_profile_popup.validation.dangerousSymbols');
        }
        break;
      case 'phoneNumber':
        if (value.trim() && !/^\+?[0-9\s-]{0,15}$/.test(value)) {
          error = t('popups:edit_profile_popup.validation.invalidPhoneFormat');
        } else if (value.trim() && value.replace(/[^0-9]/g, '').length > 15) {
          error = t('popups:edit_profile_popup.validation.invalidPhoneLength');
        }
        break;
    }

    return error;
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
      addNotification('error', t('popups:edit_profile_popup.validation.errorTitle'), error)
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
      addNotification('error', t('popups:edit_profile_popup.validation.errorTitle'), t('popups:edit_profile_popup.validation.errorMessage'))
      return
    }

    // Check if there were any changes
    if (!hasChanges()) {
      addNotification('info', t('notifications:noChanges.title'), t('notifications:noChanges.message'))
      return
    }

    try {
      // Update user data via context
      await updateUser({
        username: formData.username,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : undefined,
        place_of_work: formData.placeOfWork,
        phone_number: formData.phoneNumber,
      })
      addNotification('success', t('notifications:profileUpdated.title'), t('notifications:profileUpdated.message', { username: formData.username }))
      onClose()
    } catch {
      addNotification('error', t('notifications:profileUpdateFailed.title'), t('notifications:profileUpdateFailed.message'))
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
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
          {...({} as MotionDivProps)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-xl relative overflow-hidden"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            {...({} as MotionDivProps)}
          >
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <motion.h2
                  className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  {...({} as MotionH2Props)}
                >
                  {t('popups:edit_profile_popup.title')}
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  {...({} as MotionButtonProps)}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {[
                  { icon: User, name: 'username', type: 'text', optional: false },
                  { icon: Mail, name: 'email', type: 'email', optional: false },
                  { icon: Cake, name: 'age', type: 'number', optional: true },
                  { icon: Building2, name: 'placeOfWork', type: 'text', optional: true },
                  { icon: Phone, name: 'phoneNumber', type: 'text', optional: true }
                ].map(({ icon: Icon, name, type, optional }) => (
                  <div key={name} className="relative">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
                      {t(`popups:edit_profile_popup.labels.${name}`)}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
                        <Icon className="h-5 w-5 bg-white dark:bg-[#2a2a3e] p-0.5 rounded-full" />
                      </div>
                      <motion.input
                        type={type}
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={t(`popups:edit_profile_popup.placeholders.${name}${optional ? 'Optional' : ''}`)}
                        whileFocus="focus"
                        variants={inputVariants}
                        maxLength={name === 'phoneNumber' ? 15 : undefined}
                        className={`w-full pl-10 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-800 dark:text-gray-200 bg-white dark:bg-[#3a3a5e] placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors[name] ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-[#4a4a7e]'
                        }`}
                        {...({} as MotionInputProps)}
                      />
                    </div>
                    {errors[name] && <span className="text-red-500 dark:text-red-400 text-xs mt-1 block">{errors[name]}</span>}
                  </div>
                ))}

                {/* Add Image to Avatar
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
                    {t('popups:edit_profile_popup.labels.avatar')}
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    {image ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image src={image} alt="Profile" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white dark:text-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#3a3a5e] flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 border border-gray-300 dark:border-[#4a4a7e] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#3a3a5e] hover:bg-gray-50 dark:hover:bg-[#4a4a7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      {...({} as MotionButtonProps)}
                    >
                      <Upload className="h-4 w-4 inline-block mr-2" />
                      {t('popups:edit_profile_popup.buttons.upload')}
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
                */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#3a3a5e] hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-colors duration-300 w-full sm:w-auto"
                    {...({} as MotionButtonProps)}
                  >
                    {t('popups:edit_profile_popup.buttons.cancel')}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 text-sm rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 w-full sm:w-auto"
                    {...({} as MotionButtonProps)}
                  >
                    {t('popups:edit_profile_popup.buttons.updateProfile')}
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