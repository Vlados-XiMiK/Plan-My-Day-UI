"use client"

import { ReactNode, useEffect } from "react"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import Cookies from "js-cookie"

// Translation resources
const resources = {
  en: {
    welcome: require("../locales/en/welcome.json"),
    auth: require("../locales/en/auth.json"),
    notifications: require("../locales/en/notifications.json"),
    welcome_main: require("../locales/en/welcome_main.json"),
    tasks: require("../locales/en/tasks.json"),
    profile: require('../locales/en/profile.json'),
    legal: require('../locales/en/legal.json'),
    stats: require('../locales/en/stats.json'),
    calendar: require('../locales/en/calendar.json'),
    popups: require('../locales/en/popups.json')
  },
  ua: {
    welcome: require("../locales/ua/welcome.json"),
    auth: require("../locales/ua/auth.json"),
    notifications: require("../locales/ua/notifications.json"),
    welcome_main: require("../locales/ua/welcome_main.json"),
    tasks: require("../locales/ua/tasks.json"),
    profile: require('../locales/ua/profile.json'),
    legal: require('../locales/ua/legal.json'),
    stats: require('../locales/ua/stats.json'),
    calendar: require('../locales/ua/calendar.json'),
    popups: require('../locales/ua/popups.json')
  },
}

i18next
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    resources,
    ns: ["welcome", "auth", "notifications", "welcome_main", 
        "tasks", "profile", "legal", "stats", "calendar"],
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