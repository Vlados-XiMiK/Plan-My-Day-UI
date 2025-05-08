import type { TFunction } from "i18next";

export const formatPhoneNumber = (value: string, mask: string): string => {
  const digits = value.replace(/\D/g, "");
  let formatted = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === "#") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += mask[i];
    }
  }

  return formatted;
};

export const cleanPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, "");
};

export const validateUsername = (value: string, t: TFunction<"popups" | "notifications">): string => {
  if (value.length > 80) {
    return t("popups:edit_profile_popup.validation.usernameTooLong");
  }
  if (!value.trim()) {
    return t("popups:edit_profile_popup.validation.usernameRequired");
  }
  const dangerousSymbols = /[<>"';`\\&%#|]/;
  if (dangerousSymbols.test(value)) {
    return t("popups:edit_profile_popup.validation.dangerousSymbols");
  }
  const containsCyrillic = /[а-яА-ЯёЁ]/;
  if (containsCyrillic.test(value)) {
    return t("popups:edit_profile_popup.validation.noCyrillic");
  }
  return "";
};

export const validateEmail = (value: string, t: TFunction<"popups" | "notifications">): string => {
  if (!value.trim()) {
    return t("popups:edit_profile_popup.validation.emailRequired");
  }
  if (!/\S+@\S+\.\S+/.test(value)) {
    return t("popups:edit_profile_popup.validation.invalidEmail");
  }
  const dangerousSymbols = /[<>"';`\\&%#|]/;
  if (dangerousSymbols.test(value)) {
    return t("popups:edit_profile_popup.validation.dangerousSymbols");
  }
  const containsCyrillic = /[а-яА-ЯёЁ]/;
  if (containsCyrillic.test(value)) {
    return t("popups:edit_profile_popup.validation.noCyrillic");
  }
  return "";
};

export const validatePhoneNumber = (value: string, countryCode: string, t: TFunction<"popups" | "notifications">): string => {
  if (!value.trim()) return "";

  const cleanValue = cleanPhoneNumber(value);
  if (!/^[0-9\s+\-()]*$/.test(value)) {
    return t("popups:edit_profile_popup.validation.invalidPhoneFormat");
  }
  if (cleanValue.length < 7) {
    return t("popups:edit_profile_popup.validation.phoneTooShort");
  }
  if (cleanValue.length > 15) {
    return t("popups:edit_profile_popup.validation.phoneTooLong");
  }
  const fullPhone = `${countryCode}${cleanValue}`;
  if (fullPhone.length > 15) {
    return t("popups:edit_profile_popup.validation.phoneMaxLength");
  }
  return "";
};

export const validateField = (name: string, value: string, t: TFunction<"popups" | "notifications">): string => {
  let error = "";

  const dangerousSymbols = /[<>"';`\\&%#|]/;
  if (name !== "placeOfWork" && dangerousSymbols.test(value)) {
    return t("popups:edit_profile_popup.validation.dangerousSymbols");
  }

  const containsCyrillic = /[а-яА-ЯёЁ]/;
  if (name !== "placeOfWork" && containsCyrillic.test(value)) {
    return t("popups:edit_profile_popup.validation.noCyrillic");
  }

  switch (name) {
    case "age":
      if (value.trim()) {
        if (!/^\d+$/.test(value)) {
          error = t("popups:edit_profile_popup.validation.onlyDigits");
        } else {
          const ageNum = Number(value);
          if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
            error = t("popups:edit_profile_popup.validation.invalidAge");
          } else if (ageNum < 8) {
            error = t("popups:edit_profile_popup.validation.ageTooLow");
          } else if (ageNum > 120) {
            error = t("popups:edit_profile_popup.validation.ageTooHigh");
          }
        }
      }
      break;
    case "placeOfWork":
      const allowedPlaceOfWork = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,-]*$/;
      const forbiddenSymbols = /[<>";'`\\\/*&#%|=]/;
      if (value.trim() && !allowedPlaceOfWork.test(value)) {
        error = t("popups:edit_profile_popup.validation.invalidPlaceOfWorkChars");
      } else if (value.trim() && forbiddenSymbols.test(value)) {
        error = t("popups:edit_profile_popup.validation.dangerousSymbols");
      }
      break;
  }

  return error;
};