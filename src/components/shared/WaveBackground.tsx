"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function WaveBackground() {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Only render in premium mode
	if (!mounted || theme !== "premium") return null;

	return (
		<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden animate-fade-in">
			{/* Wave 1 - Back */}
			<div className="absolute bottom-0 left-0 w-full h-48 md:h-64 lg:h-80 opacity-20 transform translate-y-10 animate-pulse-slow">
				<svg
					className="w-full h-full"
					viewBox="0 0 1440 320"
					preserveAspectRatio="none"
				>
					<path
						fill="var(--sea-foam)"
						fillOpacity="1"
						d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
					></path>
				</svg>
			</div>

			{/* Wave 2 - Middle */}
			<div
				className="absolute bottom-0 left-0 w-full h-32 md:h-48 lg:h-64 opacity-30 transform translate-y-5 animate-bounce-slow"
				style={{ animationDuration: "6s" }}
			>
				<svg
					className="w-full h-full"
					viewBox="0 0 1440 320"
					preserveAspectRatio="none"
				>
					<path
						fill="var(--nautical-blue)"
						fillOpacity="1"
						d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
					></path>
				</svg>
			</div>

			{/* Wave 3 - Front */}
			<div
				className="absolute bottom-0 left-0 w-full h-24 md:h-36 lg:h-48 opacity-40 animate-bounce-slow"
				style={{ animationDuration: "4s" }}
			>
				<svg
					className="w-full h-full"
					viewBox="0 0 1440 320"
					preserveAspectRatio="none"
				>
					<path
						fill="var(--nautical-deep)"
						fillOpacity="0.5"
						d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
					></path>
				</svg>
			</div>
		</div>
	);
}
