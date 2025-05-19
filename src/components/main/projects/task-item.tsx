"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Task, User } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock, Edit, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, uk } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/projects/avatar";
import { motion, MotionProps } from "framer-motion";
import { HTMLAttributes } from "react";
import { useNotification } from "@/contexts/notification-context";
import { useTranslation } from "react-i18next";

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>;

interface TaskItemProps {
  task: Task;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canComplete: boolean;
  completedByUser?: User;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  canEdit,
  canComplete,
  completedByUser,
}: TaskItemProps) {
  const { t, i18n } = useTranslation(["projects", "notifications"]);
  const { addNotification } = useNotification();

  const locale = i18n.language === "ua" ? uk : enUS;

  const priorityColors = {
    H: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800", // Обновлено
    M: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", // Обновлено
    L: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800", // Обновлено
    default:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  };

  const categoryColors = {
    Design:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    Development:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    Testing:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    Marketing:
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    Other:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    default:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  };

  const createdDate = new Date(task.created_at);
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const completedDate = task.completed_at ? new Date(task.completed_at) : null; // Обновлено

  const handleToggleComplete = () => {
    try {
      onToggleComplete();
    } catch {
    
    }
  };

  const handleEdit = () => {
    try {
      onEdit();
      addNotification(
        "info",
        t("notifications:taskEditInitiated.title"),
        t("notifications:taskEditInitiated.message"),
        3000
      );
    } catch {
      addNotification(
        "error",
        t("notifications:validationError.title"),
        t("notifications:validationError.message"),
        5000
      );
    }
  };

  const handleDelete = () => {
    try {
      onDelete();
    } catch {}
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`rounded-lg border p-3 transition-all duration-300 hover:shadow-md ${
          task.completed
            ? "bg-muted/50 border-green-200 dark:border-green-900"
            : "bg-card"
        }`}
        {...({} as MotionDivProps)}
      >
        <div className="flex items-start gap-3">
          {canComplete ? (
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="mt-1 transition-all duration-300 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white flex-shrink-0"
            />
          ) : (
            <div className="w-4 h-4 mt-1 flex items-center justify-center flex-shrink-0">
              {task.completed ? (
                <Check className="h-4 w-4 text-purple-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <label
                htmlFor={canComplete ? task.id : undefined}
                className={`font-medium line-clamp-2 ${
                  task.completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                {task.title}
              </label>

              <div className="flex items-center gap-1 flex-shrink-0">
                {canEdit && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 transition-all duration-200 hover:bg-purple-500/10"
                          onClick={handleEdit}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="sr-only">
                            {t("projects:task_item.buttons.edit")}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("projects:task_item.buttons.edit")}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive transition-all duration-200 hover:bg-destructive/10"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">
                            {t("projects:task_item.buttons.delete")}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("projects:task_item.buttons.delete")}
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {task.description && (
              <p
                className={`text-sm line-clamp-2 ${
                  task.completed
                    ? "text-muted-foreground line-through"
                    : "text-muted-foreground"
                }`}
              >
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {task.priority && (
                <Badge
                  variant="outline"
                  className={`${
                    priorityColors[task.priority] || priorityColors.default
                  } transition-all duration-300 hover:shadow-sm text-xs`}
                >
                  {t(
                    `projects:task_item.priorities.${task.priority.toLowerCase()}`
                  )}
                </Badge>
              )}

              {task.category && (
                <Badge
                  variant="outline"
                  className={`${
                    categoryColors[
                      task.category as keyof typeof categoryColors
                    ] || categoryColors.default
                  } transition-all duration-300 hover:shadow-sm text-xs`}
                >
                  {task.category}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">
                  {t("projects:task_item.created", {
                    time: formatDistanceToNow(createdDate, {
                      addSuffix: true,
                      locale,
                    }),
                  })}
                </span>
              </div>

              {dueDate && (
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {t("projects:task_item.due", {
                      date: format(dueDate, "d MMM yyyy", { locale }),
                      time: format(dueDate, "HH:mm"),
                    })}
                  </span>
                </div>
              )}

              {task.completed &&
                task.completed_by &&
                completedByUser &&
                completedDate && (
                  <div className="flex items-center gap-1 mt-1 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                    <Check className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {t("projects:task_item.completedBy")}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {completedByUser.avatar ? (
                            <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage
                                src={completedByUser.avatar}
                                alt={completedByUser.username}
                              />
                              <AvatarFallback className="text-[8px]">
                                {completedByUser.username
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="inline-flex h-4 w-4 mr-1 rounded-full overflow-hidden flex-shrink-0 items-center justify-center bg-purple-500 text-white text-[8px] font-bold">
                              {completedByUser.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium line-clamp-1">
                            {completedByUser.username}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t("projects:task_item.completed", {
                            time: formatDistanceToNow(completedDate, {
                              addSuffix: true,
                              locale,
                            }),
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
