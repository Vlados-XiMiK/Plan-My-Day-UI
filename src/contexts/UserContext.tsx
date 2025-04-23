"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { User, ProfileStats, UserContextType } from "@/types"


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ completedTasks: 0, ongoingTasks: 0, totalTasks: 0 });

  useEffect(() => {
    // Устанавливаем статические данные пользователя
    const staticUser: User = {
      name: "Alex Smith",
      email: "alex.smith@example.com",
      phone: "+1234567890",
      workplace: "Tech Corp",
      age: 30,
    };
    setUser(staticUser);

    // Устанавливаем статические данные для статистики задач
    const staticStats: ProfileStats = {
      completedTasks: 15,
      ongoingTasks: 5,
      totalTasks: 20,
    };
    setStats(staticStats);

    // Позже здесь можно будет добавить fetch к базе данных
    /*
    const fetchUserAndStats = async () => {
      try {
        const userResponse = await fetch("/api/user?email=guest@example.com");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        const statsResponse = await fetch("/api/stats?email=guest@example.com");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch user or stats:", error);
      }
    };
    fetchUserAndStats();
    */
  }, []);

  return (
    <UserContext.Provider value={{ user, stats, setUser, setStats }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}