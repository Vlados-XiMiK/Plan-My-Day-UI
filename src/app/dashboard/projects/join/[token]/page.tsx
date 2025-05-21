"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { joinProject } from "@/api/projects";
import { useNotification } from "@/contexts/notification-context";
import { use } from "react";
import { useTranslation } from "react-i18next";

const JoinProjectPage = ({ params }: { params: Promise<{ token: string }> }) => {
  const router = useRouter();
  const { token } = use(params);
  const { t } = useTranslation(["notifications"]);
  const { addNotification } = useNotification();
  const hasRun = useRef(false); // Flag to prevent repeated calls

  useEffect(() => {
    if (!token || hasRun.current) return; // Skip if token is missing or has already been executed

    hasRun.current = true; // Set a flag to prevent recurrence

    const join = async () => {
      try {
        await joinProject(token);
        addNotification(
          "success",
          t("notifications:joinProjectSuccess.title"),
          t("notifications:joinProjectSuccess.message"),
          5000
        );
        router.push("/dashboard/projects");
      } catch {
        addNotification(
          "error",
          t("notifications:joinProjectError.title"),
          t("notifications:joinProjectError.message"),
          5000
        );
        router.push("/auth/login");
      }
    };

    join();
  }, [token, router, t, addNotification]);

  return null;
};

export default JoinProjectPage;