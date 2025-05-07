"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User, UserContextType } from "@/types";
import { getUserProfile, updateUserProfile } from "@/api/profile";
import { isAuthenticated } from "@/api/auth";
import Cookies from "js-cookie";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to update user data
  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await updateUserProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        console.log("Checking authentication...");

        const authenticated = await isAuthenticated();
        console.log("Is authenticated:", authenticated);
        if (!authenticated) {
          console.log("Not authenticated, redirecting to login");
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          if (isMounted) {
            window.location.href = "/auth/login";
          }
          return;
        }

        const userData = await getUserProfile();
        console.log("User data fetched:", userData);
        if (isMounted) {
          setUser(userData);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Fetch user aborted");
          return;
        }
        console.error("Failed to fetch user:", error);
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        if (isMounted) {
          window.location.href = "/auth/login";
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("Loading complete, isLoading:", false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, isLoading }}>
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