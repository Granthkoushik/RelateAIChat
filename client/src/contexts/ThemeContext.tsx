import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@shared/schema";

type Theme = "light" | "dark" | "gray" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | "gray";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user?: User;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (user?.theme) return user.theme;
    return (localStorage.getItem("theme") as Theme) || "auto";
  });

  const getSystemTheme = (): "light" | "dark" => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  };

  const resolvedTheme: "light" | "dark" | "gray" = 
    theme === "auto" ? getSystemTheme() : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "gray");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setThemeState(user.theme);
    }
  }, [user?.theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
