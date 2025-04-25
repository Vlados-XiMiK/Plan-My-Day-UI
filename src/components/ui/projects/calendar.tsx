"use client";

import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Тип CalendarProps для режима single (совместим с react-day-picker@9.6.7)
export type CalendarProps = Omit<DayPickerProps, "mode" | "onSelect"> & {
  mode?: "single";
  className?: string;
  classNames?: DayPickerProps["classNames"];
  showOutsideDays?: boolean;
  initialFocus?: boolean;
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  initialFocus,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(new Date());

  const handlePreviousMonth = () => {
    setMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const handleDayClick = (
    date: Date | undefined,
  ) => {
    onSelect?.(date);
  };

  return (
    <DayPicker
      mode={mode}
      selected={selected}
      onSelect={handleDayClick}
      month={month}
      onMonthChange={setMonth}
      showOutsideDays={showOutsideDays}
      initialFocus={initialFocus}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 pointer-events-auto",
        month: "space-y-4 pointer-events-auto",
        caption: "relative flex justify-center items-center pt-1 pointer-events-auto",
        caption_label: "text-sm font-medium mx-10",
        nav: "absolute top-1 inset-x-0 flex justify-between items-center pointer-events-none",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all duration-200 z-10 pointer-events-auto",
          "focus:ring-2 focus:ring-purple-500/20"
        ),
        nav_button_previous: "ml-1",
        nav_button_next: "mr-1",
        table: "w-full border-collapse pointer-events-auto", // Removed space-y-1 to avoid extra vertical spacing
        head_row: "flex w-full justify-between pointer-events-auto", // Ensure even spacing for header
        head_cell: cn(
          "text-muted-foreground rounded-md w-9 h-9 flex items-center justify-center font-normal text-[0.8rem] pointer-events-auto"
        ), // Fixed width and centered content
        row: "flex w-full justify-between mt-1 pointer-events-auto", // Ensure rows are evenly spaced
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative pointer-events-auto flex items-center justify-center", // Fixed dimensions and centered content
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 pointer-events-auto",
          "hover:bg-accent/50 transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Nav: ({ className }) => (
          <div className={cn("absolute top-1 inset-x-0 flex justify-between items-center pointer-events-none", className)}>
            <button
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all duration-200 ml-1 z-10 pointer-events-auto",
                "focus:ring-2 focus:ring-purple-500/20"
              )}
              onClick={handlePreviousMonth}
            >
              <svg
                className="h-4 w-4 text-muted-foreground transition-transform duration-200 hover:scale-110 hover:text-purple-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="sr-only">Previous month</span>
            </button>
            <button
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all duration-200 mr-1 z-10 pointer-events-auto",
                "focus:ring-2 focus:ring-purple-500/20"
              )}
              onClick={handleNextMonth}
            >
              <svg
                className="h-4 w-4 text-muted-foreground transition-transform duration-200 hover:scale-110 hover:text-purple-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span className="sr-only">Next month</span>
            </button>
          </div>
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };