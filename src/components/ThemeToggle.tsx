"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full relative"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Cambiar tema"
    >
      <Sun className={`h-5 w-5 transition-all ${isDark ? "opacity-0 scale-50" : "opacity-100 scale-100"}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
