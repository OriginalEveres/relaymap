import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "rm-theme";

export function useTheme(): readonly [Theme, (next: Theme) => void] {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "light";
		return (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem(THEME_KEY, theme);
	}, [theme]);

	const setTheme = useCallback((next: Theme) => setThemeState(next), []);
	return [theme, setTheme];
}
