"use client";

import { AvatarProps } from "@/types"


export default function Avatar({ name, surname, size = "large" }: AvatarProps) {

  const getInitials = () => {
    const nameParts = name?.split(" ") || [];
    const nameInitial = nameParts[0]?.[0] || "";
    const surnameInitial = (surname || nameParts[1])?.[0] || "";
    return `${nameInitial}${surnameInitial}`.toUpperCase() || "?";
  };

  const sizes = {
    small: { width: "w-8", height: "h-8", text: "text-xl" },
    large: { width: "w-32", height: "h-32", text: "text-4xl" },
  };

  const { width, height, text } = sizes[size] || sizes.large;

  return (
    <div
      className={`relative ${width} ${height} rounded-full overflow-hidden flex items-center justify-center ${text} font-bold text-white ${
        size === "large" ? "ring-4 ring-purple-100 dark:ring-purple-900" : ""
      }`}
      style={{ backgroundColor: "#A78BFA" }}
    >
      {getInitials()}
    </div>
  );
}