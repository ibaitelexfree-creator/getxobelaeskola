"use client";

import type React from "react";

/**
 * Lightweight Tooltip component
 * Shows a message on hover with a fade-in animation.
 */
export const Tooltip = ({
	children,
	text,
	position = "top",
	className = "",
}: {
	children: React.ReactNode;
	text: string;
	position?: "top" | "bottom" | "left" | "right";
	className?: string;
}) => {
	const posClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
	};

	return (
		<div className={`relative group ${className}`}>
			{children}

			<div
				className={`
                    absolute ${posClasses[position]} z-50 
                    px-2 py-1 bg-slate-900 border border-slate-700 
                    text-3xs text-slate-300 font-medium whitespace-nowrap 
                    rounded shadow-xl pointer-events-none 
                    transition-all duration-200 ease-out
                    opacity-0 translate-y-1 scale-95
                    group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                `}
			>
				{text}
				{/* Arrow */}
				<div
					className={`
                    absolute w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45
                    ${position === "top" ? "bottom-[-5px] left-1/2 -translate-x-1/2" : ""}
                    ${position === "bottom" ? "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l border-b-0 border-r-0" : ""}
                    ${position === "left" ? "right-[-5px] top-1/2 -translate-y-1/2 border-t border-l border-b-0 border-r-0" : ""}
                    ${position === "right" ? "left-[-5px] top-1/2 -translate-y-1/2" : ""}
                `}
				/>
			</div>
		</div>
	);
};
