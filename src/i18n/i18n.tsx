"use client"

import { ReactNode, useEffect } from "react"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import Cookies from "js-cookie"

// Translation resources
import welcome_en from "../locales/en/welcome.json"
import auth_en from "../locales/en/auth.json"
import notifications_en from "../locales/en/notifications.json"
import welcome_main_en from "../locales/en/welcome_main.json"
import tasks_en from "../locales/en/tasks.json"
import profile_en from "../locales/en/profile.json"
import legal_en from "../locales/en/legal.json"
import stats_en from "../locales/en/stats.json"
import calendar_en from "../locales/en/calendar.json"
import popups_en from "../locales/en/popups.json"
import projects_en from "../locales/en/projects.json"
import categories_en from "../locales/en/categories.json"

import welcome_ua from "../locales/ua/welcome.json"
import auth_ua from "../locales/ua/auth.json"
import notifications_ua from "../locales/ua/notifications.json"
import welcome_main_ua from "../locales/ua/welcome_main.json"
import tasks_ua from "../locales/ua/tasks.json"
import profile_ua from "../locales/ua/profile.json"
import legal_ua from "../locales/ua/legal.json"
import stats_ua from "../locales/ua/stats.json"
import calendar_ua from "../locales/ua/calendar.json"
import popups_ua from "../locales/ua/popups.json"
import projects_ua from "../locales/ua/projects.json"
import categories_ua from "../locales/ua/categories.json"

// Translation resources
const resources = {
  en: {
    welcome: welcome_en,
    auth: auth_en,
    notifications: notifications_en,
    welcome_main: welcome_main_en,
    tasks: tasks_en,
    profile: profile_en,
    legal: legal_en,
    stats: stats_en,
    calendar: calendar_en,
    popups: popups_en,
    projects: projects_en,
    categories: categories_en
  },
  ua: {
    welcome: welcome_ua,
    auth: auth_ua,
    notifications: notifications_ua,
    welcome_main: welcome_main_ua,
    tasks: tasks_ua,
    profile: profile_ua,
    legal: legal_ua,
    stats: stats_ua,
    calendar: calendar_ua,
    popups: popups_ua,
    projects: projects_ua,
    categories: categories_ua
  },
}

i18next
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    resources,
    ns: ["welcome", "auth", "notifications", "welcome_main", 
        "tasks", "profile", "legal", "stats", "calendar", "projects", "categories"],
    defaultNS: "welcome",
    interpolation: {
      escapeValue: false,
    },
  })

export const I18nextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    const storedLanguage = Cookies.get("language") as "en" | "ua" | undefined
    const browserLanguage = navigator.language.split("-")[0] as "en" | "ua"
    const initialLanguage = storedLanguage || (browserLanguage === "ua" ? "ua" : "en")
    
    i18next.changeLanguage(initialLanguage)
    Cookies.set("language", initialLanguage, { expires: 365 })
  }, [])

  return <>{children}</>
}

export const setLanguage = (lang: "en" | "ua") => {
  i18next.changeLanguage(lang)
  Cookies.set("language", lang, { expires: 365 })
}

i18next.on("initialized", () => {
  console.log("i18next initialized", i18next.services.resourceStore.data)
})