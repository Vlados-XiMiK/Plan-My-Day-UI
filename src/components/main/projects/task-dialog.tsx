"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/types/project";
import type { Category } from "@/types";
import { CalendarIcon, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { enUS, uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, MotionProps, AnimatePresence } from "framer-motion";
import CustomCalendar from "@/components/ui/projects/custom-calendar";
import { useNotification } from "@/contexts/notification-context";
import { useTranslation } from "react-i18next";
import { HTMLAttributes } from "react";
import { fetchCategories } from "@/lib/tasks-data";

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask?: (
    task: Omit<
      Task,
      | "id"
      | "user"
      | "user_name"
      | "created_at"
      | "updated_at"
      | "completed_at"
      | "completed_by"
      | "completed_by_name"
    >
  ) => void;
  onEditTask?: (task: Task) => void;
  task?: Task;
  categories?: Category[]; // Добавляем пропс для категорий
}

export default function TaskDialog({
  open,
  onOpenChange,
  onAddTask,
  onEditTask,
  task,
  categories: propCategories, // Принимаем категории через пропсы
}: TaskDialogProps) {
  const { t, i18n } = useTranslation(["popups", "notifications"]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"H" | "M" | "L">("M");
  const [category, setCategory] = useState<string | null>(null); // Храним category.id как строку
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState<string>("23:59");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(propCategories || []); // Используем propCategories, если переданы
  const { addNotification } = useNotification();

  const locale = i18n.language === "ua" ? uk : enUS;
  const dateFormat = i18n.language === "ua" ? "d MMMM yyyy" : "MMMM d, yyyy";

  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  const isEditing = !!task;
  const isDateSelectionEnabled = title.trim() && description.trim() && priority;

  useEffect(() => {
    if (open && !propCategories) { // Загружаем категории только если не переданы через пропсы
      fetchCategories()
        .then((fetchedCategories) => {
          setCategories(fetchedCategories);
        })
        .catch(() => {
          addNotification(
            "error",
            t("notifications:fetchCategoriesFailed.title"),
            t("notifications:fetchCategoriesFailed.message"),
            5000
          );
        });
    }
  }, [open, t, addNotification, propCategories]);

  const isValidDateTime = () => {
    if (!dueDate || !dueTime) return true;
    const now = new Date();
    const [hours, minutes] = dueTime.split(":").map(Number);
    const selectedDateTime = new Date(dueDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    return selectedDateTime >= now;
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "M");
      setCategory(task.category ? task.category.toString() : null); // Преобразуем category.id в строку

      if (task.due_date) {
        const date = new Date(task.due_date);
        setDueDate(date);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        setDueTime(`${hours}:${minutes}`);
      } else {
        setDueDate(undefined);
        setDueTime("23:59");
      }
    } else {
      setTitle("");
      setDescription("");
      setPriority("M");
      setCategory(null);
      setDueDate(undefined);
      setDueTime("23:59");
    }
    setIsCalendarOpen(false);
  }, [task, open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addNotification(
        "error",
        t("notifications:invalidInput.title"),
        t("notifications:invalidInput.taskTitle"),
        5000
      );
      return;
    }
    if (!description.trim()) {
      addNotification(
        "error",
        t("notifications:invalidInput.title"),
        t("notifications:invalidInput.taskDescription"),
        5000
      );
      return;
    }
    if (!priority) {
      addNotification(
        "error",
        t("notifications:invalidInput.title"),
        t("notifications:invalidInput.taskPriority"),
        5000
      );
      return;
    }
    if (!dueDate) {
      addNotification(
        "error",
        t("notifications:invalidInput.title"),
        t("notifications:invalidInput.taskDueDate"),
        5000
      );
      return;
    }
    if (!isValidDateTime()) {
      addNotification(
        "error",
        t("notifications:invalidDate.title"),
        t("notifications:invalidDate.past"),
        5000
      );
      return;
    }

    let due_date: string | null = null;
    if (dueDate) {
      const [hours, minutes] = dueTime.split(":").map(Number);
      const dateWithTime = new Date(dueDate);
      dateWithTime.setHours(hours, minutes, 0, 0);
      due_date = dateWithTime.toISOString();
    }

    const taskData = {
      title,
      description,
      due_date,
      priority,
      category: category ? parseInt(category) : null, // Преобразуем в число для отправки
      completed: isEditing ? task.completed : false,
      is_favorite: isEditing ? task.is_favorite : false,
    };

    try {
      if (isEditing && onEditTask && task) {
        onEditTask({
          ...task,
          ...taskData,
          updated_at: new Date().toISOString(),
        });
      } else if (onAddTask) {
        onAddTask(taskData);
      }
      onOpenChange(false);
    } catch {
      addNotification(
        "error",
        t("notifications:taskSaveFailed.title"),
        t("notifications:taskSaveFailed.message"),
        5000
      );
    }
  };

  const handleDateSelect = (date: Date) => {
    setDueDate(date);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (!isToday) {
      setIsCalendarOpen(false);
    }

    if (!dueTime || dueTime === "") {
      if (isToday) {
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        const hours = nextHour.getHours().toString().padStart(2, "0");
        const minutes = nextHour.getMinutes().toString().padStart(2, "0");
        setDueTime(`${hours}:${minutes}`);
      } else {
        setDueTime("23:59");
      }
    }
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDueDate(undefined);
    setDueTime("23:59");
    addNotification(
      "info",
      t("notifications:dateCleared.title"),
      t("notifications:dateCleared.message"),
      3000
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? t("popups:task_dialog.title.edit")
                : t("popups:task_dialog.title.create")}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t("popups:task_dialog.description.edit")
                : t("popups:task_dialog.description.create")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="title">
                {t("popups:task_dialog.labels.title")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("popups:task_dialog.placeholders.title")}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="description">
                {t("popups:task_dialog.labels.description")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("popups:task_dialog.placeholders.description")}
                rows={3}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
              />
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              {...({} as MotionDivProps)}
            >
              <div className="grid gap-2">
                <Label htmlFor="priority">
                  {t("popups:task_dialog.labels.priority")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value: "H" | "M" | "L") => setPriority(value)}
                  required
                >
                  <SelectTrigger
                    id="priority"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <SelectValue
                      placeholder={t("popups:task_dialog.placeholders.priority")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H">
                      {t("popups:task_dialog.priorities.high")}
                    </SelectItem>
                    <SelectItem value="M">
                      {t("popups:task_dialog.priorities.medium")}
                    </SelectItem>
                    <SelectItem value="L">
                      {t("popups:task_dialog.priorities.low")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">
                  {t("popups:task_dialog.labels.category")}
                </Label>
                <Select
                  value={category ?? "none"}
                  onValueChange={(value) =>
                    setCategory(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger
                    id="category"
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <SelectValue
                      placeholder={t("popups:task_dialog.placeholders.category")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("popups:task_dialog.placeholders.category")}
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              {...({} as MotionDivProps)}
            >
              <Label htmlFor="dueDate">
                {t("popups:task_dialog.labels.dueDate")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Button
                    ref={calendarButtonRef}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 pr-10",
                      !dueDate && "text-muted-foreground",
                      isCalendarOpen &&
                        "border-purple-500 ring-2 ring-purple-500/20"
                    )}
                    onClick={() =>
                      isDateSelectionEnabled &&
                      setIsCalendarOpen(!isCalendarOpen)
                    }
                    disabled={!isDateSelectionEnabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? format(dueDate, dateFormat, { locale })
                      : t("popups:task_dialog.placeholders.date")}
                    {dueDate && (
                      <span
                        onClick={clearDate}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">
                          {t("popups:task_dialog.buttons.clearDate")}
                        </span>
                      </span>
                    )}
                  </Button>
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        ref={calendarRef}
                        className="absolute z-50 bottom-full mb-1 w-full sm:w-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        {...({} as MotionDivProps)}
                      >
                        <CustomCalendar
                          selectedDate={dueDate}
                          onDateSelect={handleDateSelect}
                          className="w-full sm:w-[280px]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="pl-10 w-full sm:w-[120px] transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    disabled={!dueDate}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dueDate
                  ? isValidDateTime()
                    ? t("popups:task_dialog.dueDateText", {
                        date: format(dueDate, dateFormat, { locale }),
                        time: dueTime,
                      })
                    : t("popups:task_dialog.dueDateInvalid")
                  : t("popups:task_dialog.noDueDate")}
              </p>
            </motion.div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-200 hover:bg-destructive/10"
            >
              {t("popups:task_dialog.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              className="transition-all duration-300 hover:shadow-md bg-purple-600 hover:bg-purple-700"
              disabled={dueDate && !isValidDateTime()}
            >
              {isEditing
                ? t("popups:task_dialog.buttons.save")
                : t("popups:task_dialog.buttons.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}