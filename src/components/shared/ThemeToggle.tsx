"use client";

import { Anchor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-9 h-9" />; // Placeholder to avoid layout shift
	}

	const toggleTheme = () => {
		// Cycle: Dark -> Premium -> Light -> Dark
		if (theme === "dark") {
			setTheme("premium");
		} else if (theme === "premium") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	const getIcon = () => {
		if (theme === "premium")
			return <Anchor className="w-4 h-4 text-nautical-black" />;
		if (theme === "light") return <Sun className="w-4 h-4 text-yellow-600" />;
		return <Moon className="w-4 h-4 text-white/70" />;
	};

	const getLabel = () => {
		if (theme === "premium") return "Premium";
		if (theme === "light") return "Light";
		return "Dark";
	};

	return (
		<button
			onClick={toggleTheme}
			className={`
        flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
        ${theme === "premium" ? "bg-accent shadow-[0_0_15px_rgba(173,232,244,0.4)] rotate-12" : ""}
        ${theme === "light" ? "bg-yellow-100 shadow-lg" : ""}
        ${theme === "dark" ? "bg-white/5 hover:bg-white/10" : ""}
      `}
			aria-label={`Switch to ${theme === "dark" ? "Premium" : theme === "premium" ? "Light" : "Dark"} Theme`}
			title={`Current: ${getLabel()}`}
		>
			{getIcon()}
		</button>
	);
}
