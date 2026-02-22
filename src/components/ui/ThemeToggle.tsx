"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useThemeStore } from "@/lib/store/useThemeStore";

export default function ThemeToggle() {
	const { theme, setTheme } = useThemeStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button className="p-2 rounded-full text-white/40 hover:text-white transition-colors">
				<div className="w-5 h-5 bg-white/10 rounded-full animate-pulse" />
			</button>
		);
	}

	const toggleTheme = () => {
		if (theme === "light") setTheme("dark");
		else if (theme === "dark") setTheme("system");
		else setTheme("light");
	};

	const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

	return (
		<button
			onClick={toggleTheme}
			className="p-2 rounded-full text-white/40 hover:text-accent transition-colors relative group"
			aria-label="Toggle theme"
		>
			<Icon className="w-5 h-5" />
			<span className="sr-only">Toggle theme</span>

			{/* Tooltip */}
			<span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
				{theme === "light"
					? "Light Mode"
					: theme === "dark"
						? "Dark Mode"
						: "System Theme"}
			</span>
		</button>
	);
}
