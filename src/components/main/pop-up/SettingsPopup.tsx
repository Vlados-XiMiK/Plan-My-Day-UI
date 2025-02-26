// components/main/pop-up/SettingsPopup.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionProps } from "framer-motion"; 
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import Switch from "@/components/ui/Switch"; 
import { Label } from "@/components/ui/label"; 
import { Button } from "@/components/ui/button";
import en from "@/translations/en.json";
import ukTranslations from "@/translations/uk.json";
import { HTMLAttributes } from "react";

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPopup({ isOpen, onClose }: SettingsPopupProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true); // status for notifications
  const t = language === "uk" ? ukTranslations : en;

  // Зload status notifications
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications") === "true";
    setNotifications(savedNotifications);
  }, []);

  // Saving status notifications
  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", checked.toString());
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLanguageChange = () => {
    setLanguage(language === "en" ? "uk" : "en");
  };

  // Animations
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          {...({} as MotionDivProps)}
        >
          <motion.div
            className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            {...({} as MotionDivProps)}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              {t.settings.title || "Settings"}
            </h2>

            <div className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-800 dark:text-gray-200 font-medium">{t.settings.theme || "Theme"}</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                      theme === "light"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {t.settings.lightTheme || "Light"}
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {t.settings.darkTheme || "Dark"}
                  </Button>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-800 dark:text-gray-200 font-medium">{t.settings.language || "Language"}</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => handleLanguageChange()}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                      language === "en"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    English
                  </Button>
                  <Button
                    variant={language === "uk" ? "default" : "outline"}
                    onClick={() => handleLanguageChange()}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                      language === "uk"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    Українська
                  </Button>
                </div>
              </div>

              {/* Notification */}
              <div className="flex items-center justify-between">
                <Label className="text-gray-800 dark:text-gray-200 font-medium">
                  {t.settings.notifications || "Task Reminders"}
                </Label>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                  className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-200"
              >
                {t.settings.close || "Close"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}