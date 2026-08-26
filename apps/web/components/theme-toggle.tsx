"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative overflow-hidden rounded-full w-9 h-9 text-muted-foreground hover:bg-muted transition-colors"
      title="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun className="absolute h-4 w-4 transition-all duration-500 ease-in-out dark:-translate-y-8 dark:opacity-0 dark:rotate-90 translate-y-0 opacity-100 rotate-0 text-amber-500" />
        <Moon className="absolute h-4 w-4 transition-all duration-500 ease-in-out translate-y-8 opacity-0 -rotate-90 dark:translate-y-0 dark:opacity-100 dark:rotate-0 text-blue-400" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
