'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User2, Mail, Phone, Building2, Clock, Edit2, Settings, LogOut, ArrowLeft } from 'lucide-react'
import EditProfilePopup from '@/components/main/pop-up/EditProfilePopup'
import SettingsPopup from '@/components/main/pop-up/SettingsPopup'
import { useUser } from '@/contexts/UserContext'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { uk, enUS } from 'date-fns/locale'
import Avatar from '@/components/ui/Avatar'
import Loader from '@/components/ui/preloader'
import { isAuthenticated, logoutUser } from '@/api/auth'
import { useNotification } from '@/contexts/notification-context'

export default function Profile() {
  const { t, i18n } = useTranslation(['profile', 'notifications'])
  const [isEditing, setIsEditing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const { addNotification } = useNotification()

  // Проверка авторизации
  useEffect(() => {
    async function checkAuth() {
      try {
        const auth = await isAuthenticated()
        console.log("Profile: isAuthenticated:", auth)
        setIsAuth(auth)
        setAuthLoading(false)

        if (!auth) {
          console.log("Profile: Not authenticated, redirecting to login")
          router.replace('/auth/login')
        }
      } catch (error) {
        console.error("Profile: Authentication check failed:", error)
        setIsAuth(false)
        setAuthLoading(false)
        router.replace('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  // Проверка размера экрана для десктопного отображения
  useEffect(() => {
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768)
    updateIsDesktop()
    window.addEventListener('resize', updateIsDesktop)
    return () => window.removeEventListener('resize', updateIsDesktop)
  }, [])

  // Функция логаута
  const handleLogout = async () => {
    try {
      await logoutUser()
      addNotification('success', t('notifications:logoutSuccessTitle'), t('notifications:logoutSuccessMessage'))
      router.replace('/auth/login')
    } catch (error: unknown) {
      console.error('Logout error:', error)
      // Safely handle the error, assuming it might be an Error instance
      const errorMessage = error instanceof Error ? error.message : t('notifications:logoutErrorMessage')
      addNotification('error', t('notifications:logoutErrorTitle'), errorMessage)
      router.replace('/auth/login')
    }
  }

  if (authLoading || isLoading) {
    return <Loader />
  }

  if (!isAuth) {
    return null
  }

  if (!user) {
    console.log("Profile: No user data, redirecting to login")
    router.replace('/auth/login')
    return null
  }

  const formatActivityDate = (dateString: string | null) => {
    if (!dateString) return t('never');
    const date = new Date(dateString)
    const locale = i18n.language === 'ua' ? uk : enUS
    const dateFormat = i18n.language === 'ua' ? 'd MMMM yyyy' : 'MMM d, yyyy'
    const timeFormat = 'HH:mm'
    const formattedDate = format(date, dateFormat, { locale })
    const formattedTime = format(date, timeFormat)
    return i18n.language === 'ua'
      ? `${formattedDate} о ${formattedTime}`
      : `${formattedDate} at ${formattedTime}`
  }

  return (
    <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen relative pb-24 md:pb-32 h-full overflow-y-auto">
      <div className="relative z-20">
        <div className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('title')}</h1>
            <button
              onClick={() => router.push('/dashboard/tasks')}
              className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-[#3a3a5e] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToTasks')}
            </button>
          </div>

          <div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6">
            <Avatar name={user.username} surname="" />

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{user.username}</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm sm:text-base"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('editProfile')}
                  </button>
                  <EditProfilePopup isOpen={isEditing} onClose={() => setIsEditing(false)} />
                  {isDesktop && (
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-[#3a3a5e] text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-all duration-200 text-sm sm:text-base"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t('settings')}
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-all duration-200 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t('emailLabel')}: {user.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t('phoneLabel')}: {user.phone_number || t('notSet')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Building2 className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t('workplaceLabel')}: {user.place_of_work || t('notSet')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <User2 className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {t('ageLabel')}: {user.age ?? t('notSet')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <div className="mt-6 bg-white dark:bg-[#2a2a3e] rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('recentActivity')}</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="break-words">
                {t('lastLogin')}: {formatActivityDate(user.last_login_at)}
              </span>
            </div>
            <div className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="break-words">
                {t('profileEdited')}: {formatActivityDate(user.last_profile_edit_at)}
              </span>
            </div>
            <div className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="break-words">
                {t('lastTaskCompleted')}: {formatActivityDate(user.last_task_completed_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}