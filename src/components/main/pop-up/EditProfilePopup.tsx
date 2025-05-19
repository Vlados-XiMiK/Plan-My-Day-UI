"use client";

import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Cake,
  Building2,
  Phone,
} from "lucide-react";
import { useNotification } from "@/contexts/notification-context";
import { useUser } from "@/contexts/UserContext";
import {
  InputHTMLAttributes,
  HTMLAttributes,
  ButtonHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";
import { countryCodes } from "@/lib/countryCodes";
import {
  formatPhoneNumber,
  cleanPhoneNumber,
  validateUsername,
  validateEmail,
  validatePhoneNumber,
  validateField,
} from "@/utils/editProfileUtils";

// type for motion.input
type MotionInputProps = MotionProps & InputHTMLAttributes<HTMLInputElement>;

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>;

// type for motion.button
type MotionButtonProps = MotionProps & ButtonHTMLAttributes<HTMLButtonElement>;

// type for motion.h2
type MotionH2Props = MotionProps & HTMLAttributes<HTMLHeadingElement>;

// type for motion.select
type MotionSelectProps = MotionProps & SelectHTMLAttributes<HTMLSelectElement>;

interface EditProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ErrorDetail {
  username?: string[];
  email?: string[];
}

interface UpdateError {
  cause?: {
    detail?: ErrorDetail;
  };
}

export default function EditProfilePopup({
  isOpen,
  onClose,
}: EditProfilePopupProps) {
  const { t } = useTranslation(["popups", "notifications"]);
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: "",
    placeOfWork: "",
    phoneNumber: "",
    countryCode: "+380",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notificationShown, setNotificationShown] = useState(false);
  const { addNotification } = useNotification();

  // Initialize the form with user data when opening the popup
  useEffect(() => {
    if (isOpen && user) {
      const phone = user.phone_number || "";
      const selectedCountry = countryCodes.find((c) =>
        phone.startsWith(c.code)
      ) || countryCodes.find((c) => c.code === "+380");
      const phoneNumber = selectedCountry
        ? phone.replace(selectedCountry.code, "").trim()
        : phone;
      const formattedPhoneNumber = selectedCountry
        ? formatPhoneNumber(phoneNumber, selectedCountry.mask)
        : phoneNumber;
      setFormData({
        username: user.username || "",
        email: user.email || "",
        age: user.age?.toString() || "",
        placeOfWork: user.place_of_work || "",
        phoneNumber: formattedPhoneNumber,
        countryCode: selectedCountry?.code || "+380",
      });
    }
  }, [isOpen, user]);

  // Check if changes have been made
  const hasChanges = () => {
    if (!user) return false;
    const cleanPhone = cleanPhoneNumber(formData.phoneNumber);
    const fullPhone = formData.phoneNumber ? `${formData.countryCode}${cleanPhone}` : "";
    return (
      formData.username !== (user.username || "") ||
      formData.email !== (user.email || "") ||
      formData.age !== (user.age?.toString() || "") ||
      formData.placeOfWork !== (user.place_of_work || "") ||
      fullPhone !== (user.phone_number || "")
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "username") {
        const error = validateUsername(value, t);
        if (error) newErrors[key] = error;
      } else if (key === "email") {
        const error = validateEmail(value, t);
        if (error) newErrors[key] = error;
      } else if (key === "phoneNumber") {
        const error = validatePhoneNumber(value, formData.countryCode, t);
        if (error) newErrors[key] = error;
      } else if (key !== "countryCode") {
        const error = validateField(key, value, t);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Restrict phoneNumber input to digits, spaces, hyphens, +, parentheses
    if (name === "phoneNumber") {
      if (value !== "" && !/^[0-9\s+\-()]*$/.test(value)) {
        return;
      }
      const digits = cleanPhoneNumber(value);
      if (digits.length > 15) {
        return;
      }
      const selectedCountry = countryCodes.find(
        (c) => c.code === formData.countryCode
      );
      if (selectedCountry) {
        const formatted = formatPhoneNumber(digits, selectedCountry.mask);
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
    // Restrict age input to only digits
    else if (name === "age") {
      if (value !== "" && !/^\d*$/.test(value)) {
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Handle country code change
    else if (name === "countryCode") {
      setFormData((prev) => ({
        ...prev,
        countryCode: value,
        phoneNumber: "",
      }));
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      return;
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Validation only for placeOfWork (excluding username, email, phoneNumber and age)
    if (name === "placeOfWork") {
      const error = validateField(name, value, t);
      setErrors((prev) => ({ ...prev, [name]: error }));
      if (error && !notificationShown) {
        addNotification(
          "error",
          t("popups:edit_profile_popup.validation.errorTitle"),
          error
        );
        setNotificationShown(true);
      } else if (!error) {
        setNotificationShown(false);
      }
    } else {
      // Clear errors for username, email, phoneNumber and age when entering
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      addNotification(
        "error",
        t("popups:edit_profile_popup.validation.errorTitle"),
        t("popups:edit_profile_popup.validation.errorMessage")
      );
      return;
    }

    if (!hasChanges()) {
      addNotification(
        "info",
        t("notifications:noChanges.title"),
        t("notifications:noChanges.message")
      );
      return;
    }

    try {
      const cleanPhone = cleanPhoneNumber(formData.phoneNumber);
      const fullPhone = formData.phoneNumber ? `${formData.countryCode}${cleanPhone}` : "";
      await updateUser({
        username: formData.username,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : undefined,
        place_of_work: formData.placeOfWork,
        phone_number: fullPhone,
      });
      addNotification(
        "success",
        t("notifications:profileUpdated.title"),
        t("notifications:profileUpdated.message", {
          username: formData.username,
        })
      );
      onClose();
    } catch (error: unknown) {
      const newErrors: Record<string, string> = {};
      let errorMessage = t("notifications:profileUpdateFailed.message");

      // Safely check if error has the expected structure
      const updateError = error as UpdateError;
      if (
        updateError.cause?.detail?.username?.[0]?.includes(
          "user with this username already exists"
        )
      ) {
        newErrors.username = t(
          "popups:edit_profile_popup.validation.usernameTaken"
        );
        errorMessage = newErrors.username;
      }

      if (
        updateError.cause?.detail?.email?.[0]?.includes(
          "user with this email already exists"
        )
      ) {
        newErrors.email = t("popups:edit_profile_popup.validation.emailTaken");
        errorMessage = newErrors.email;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
      }

      addNotification(
        "error",
        t("notifications:profileUpdateFailed.title"),
        errorMessage
      );
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 10 },
    },
  };

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
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-[#2a2a3e] rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-xl relative overflow-hidden"
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
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
                  {t("popups:edit_profile_popup.title")}
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
                  {
                    icon: User,
                    name: "username",
                    type: "text",
                    optional: false,
                  },
                  { icon: Mail, name: "email", type: "email", optional: false },
                  { icon: Cake, name: "age", type: "text", optional: true },
                  {
                    icon: Building2,
                    name: "placeOfWork",
                    type: "text",
                    optional: true,
                  },
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
                        placeholder={t(
                          `popups:edit_profile_popup.placeholders.${name}${
                            optional ? "Optional" : ""
                          }`
                        )}
                        whileFocus="focus"
                        variants={inputVariants}
                        maxLength={name === "username" ? 80 : undefined}
                        className={`w-full pl-10 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-800 dark:text-gray-200 bg-white dark:bg-[#3a3a5e] placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors[name]
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-200 dark:border-[#4a4a7e]"
                        }`}
                        {...(name === "age"
                          ? { pattern: "\\d*", inputMode: "numeric" }
                          : {})}
                        {...({} as MotionInputProps)}
                      />
                    </div>
                    {errors[name] && (
                      <span className="text-red-500 dark:text-red-400 text-xs mt-1 block">
                        {errors[name]}
                      </span>
                    )}
                  </div>
                ))}

                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
                    {t("popups:edit_profile_popup.labels.phoneNumber")}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0 z-50">
                      <motion.select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        whileFocus="focus"
                        variants={inputVariants}
                        className={`appearance-none w-32 pl-3 pr-8 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-800 dark:text-gray-200 bg-white dark:bg-[#3a3a5e] hover:bg-gray-50 dark:hover:bg-[#4a4a7e] cursor-pointer ${
                          errors.phoneNumber
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-200 dark:border-[#4a4a7e]"
                        }`}
                        {...({} as MotionSelectProps)}
                      >
                        {countryCodes.map((country) => (
                          <option
                            key={country.isoCode}
                            value={country.code}
                            className="bg-white dark:bg-[#3a3a5e] text-gray-800 dark:text-gray-200"
                          >
                            {country.flag} {country.code} ({country.name})
                          </option>
                        ))}
                      </motion.select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="relative flex-grow">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
                        <Phone className="h-5 w-5 bg-white dark:bg-[#2a2a3e] p-0.5 rounded-full" />
                      </div>
                      <motion.input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder={t(
                          "popups:edit_profile_popup.placeholders.phoneNumberOptional"
                        )}
                        whileFocus="focus"
                        variants={inputVariants}
                        maxLength={20}
                        inputMode="tel"
                        pattern="[0-9\\s\\+\\-\\(\\)]*"
                        className={`w-full pl-10 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-800 dark:text-gray-200 bg-white dark:bg-[#3a3a5e] placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.phoneNumber
                            ? "border-red-500 dark:border-red-400"
                            : "border-gray-200 dark:border-[#4a4a7e]"
                        }`}
                        {...({} as MotionInputProps)}
                      />
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <span className="text-red-500 dark:text-red-400 text-xs mt-1 block">
                      {errors.phoneNumber}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#3a3a5e] hover:bg-gray-200 dark:hover:bg-[#4a4a7e] transition-colors duration-300 w-full sm:w-auto"
                    {...({} as MotionButtonProps)}
                  >
                    {t("popups:edit_profile_popup.buttons.cancel")}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-1.5 text-sm rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-300 w-full sm:w-auto"
                    {...({} as MotionButtonProps)}
                  >
                    {t("popups:edit_profile_popup.buttons.updateProfile")}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}