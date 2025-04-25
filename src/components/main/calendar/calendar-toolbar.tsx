"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, CheckCircle2, Grid, List, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/types"
import { useMobile } from "@/hooks/use-mobile" // Import useMobile hook

type CalendarToolbarProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  view: "month" | "list"
  setView: (view: "month" | "list") => void
  categories: Category[]
  selectedCategories: string[]
  toggleCategory: (category: string) => void
  clearCategoryFilters: () => void
  showCompleted: boolean
  toggleShowCompleted: () => void
}

export default function CalendarToolbar({
  searchQuery,
  setSearchQuery,
  view,
  setView,
  categories,
  selectedCategories,
  toggleCategory,
  clearCategoryFilters,
  showCompleted,
  toggleShowCompleted,
}: CalendarToolbarProps) {
  const isMobile = useMobile() // Use the mobile hook to detect mobile devices

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* On mobile, use a more compact filter button */}
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-lg flex items-center gap-1">
                <Filter className="h-4 w-4" />
                {selectedCategories.length > 0 && (
                  <span className="ml-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full px-1.5">
                    {selectedCategories.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer rounded-lg flex items-center gap-2",
                  showCompleted ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "",
                )}
                onClick={toggleShowCompleted}
              >
                {showCompleted ? <CheckCircle2 className="h-4 w-4" /> : null}
                {showCompleted ? "Hide" : "Show"} completed
              </DropdownMenuItem>

              <DropdownMenuItem className="font-medium pt-2">Categories</DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.name}
                  className={cn(
                    "cursor-pointer rounded-lg flex items-center gap-2 pl-4",
                    selectedCategories.includes(category.name) &&
                      "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 font-medium",
                  )}
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.name}
                  {selectedCategories.includes(category.name) && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}

              {selectedCategories.length > 0 && (
                <DropdownMenuItem onClick={clearCategoryFilters} className="text-xs rounded-lg mt-1">
                  Clear filters ({selectedCategories.length})
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg flex items-center gap-1">
                  Categories
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto rounded-xl">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.name}
                    className={cn(
                      "cursor-pointer rounded-lg flex items-center gap-2",
                      selectedCategories.includes(category.name) &&
                        "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 font-medium",
                    )}
                    onClick={() => toggleCategory(category.name)}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                    {selectedCategories.includes(category.name) && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedCategories.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCategoryFilters} className="text-xs rounded-lg ml-1">
                Clear filters ({selectedCategories.length})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={toggleShowCompleted}
              className={cn(
                "text-xs rounded-lg flex items-center gap-1",
                showCompleted ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "",
              )}
            >
              {showCompleted ? <CheckCircle2 className="h-3 w-3" /> : null}
              {showCompleted ? "Hide" : "Show"} completed
            </Button>
          </>
        )}

        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "month" | "list")}>
          <ToggleGroupItem value="month" aria-label="Month view" className="rounded-l-xl">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="rounded-r-xl">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
