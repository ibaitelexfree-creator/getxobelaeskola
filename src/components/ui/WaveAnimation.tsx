"use client";

import React from "react";

export default function WaveAnimation() {
	return (
		<div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
			<svg
				className="absolute bottom-0 w-full h-[30vh] md:h-[50vh]"
				viewBox="0 24 150 28"
				preserveAspectRatio="none"
				shapeRendering="auto"
			>
				<defs>
					<path
						id="gentle-wave"
						d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
					/>
				</defs>
				<g className="parallax">
					<use
						href="#gentle-wave"
						x="48"
						y="0"
						className="fill-ocean-light/30 dark:fill-nautical-blue/20 animate-[wave_25s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite]"
					/>
					<use
						href="#gentle-wave"
						x="48"
						y="3"
						className="fill-ocean-medium/30 dark:fill-nautical-blue/30 animate-[wave_20s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite]"
					/>
					<use
						href="#gentle-wave"
						x="48"
						y="5"
						className="fill-ocean-dark/30 dark:fill-nautical-deep/40 animate-[wave_15s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite]"
					/>
					<use
						href="#gentle-wave"
						x="48"
						y="7"
						className="fill-ocean-deep/30 dark:fill-nautical-black/50 animate-[wave_10s_cubic-bezier(0.55,0.5,0.45,0.5)_infinite]"
					/>
				</g>
			</svg>
		</div>
	);
}
