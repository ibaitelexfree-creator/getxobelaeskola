"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

import { getOptimizedExternalImage } from "@/lib/utils/image";

type NauticalCategory =
	| "veleros"
	| "kayak"
	| "paddle"
	| "windsurf"
	| "piragua"
	| "academy"
	| "general";

interface NauticalImageProps extends Omit<ImageProps, "onError"> {
	fallbackSrc?: string;
	category?: NauticalCategory;
	autoOptimize?: boolean;
}

const CATEGORY_FALLBACKS: Record<NauticalCategory, string> = {
	veleros: "/images/J80.webp",
	kayak: "/images/home-hero-sailing-action.webp",
	paddle: "/images/home-hero-sailing-action.webp",
	windsurf: "/images/courses/PerfeccionamientoVela.webp",
	piragua: "/images/home-hero-sailing-action.webp",
	academy: "/images/courses/CursodeVelaLigera.webp",
	general: "/images/home-hero-sailing-action.webp",
};

export default function NauticalImage({
	src,
	alt,
	category = "general",
	fallbackSrc,
	autoOptimize = true,
	className,
	...props
}: NauticalImageProps) {
	const defaultFallback = useMemo(
		() => CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.general,
		[category],
	);
	const [imgSrc, setImgSrc] = useState(src);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		setImgSrc(src);
		setHasError(false);
	}, [src]);

	// Apply optimization if it's an external URL and autoOptimize is enabled
	const finalSrc = useMemo(() => {
		const baseSrc =
			!imgSrc || hasError ? fallbackSrc || defaultFallback : imgSrc;
		if (
			autoOptimize &&
			typeof baseSrc === "string" &&
			baseSrc.startsWith("http")
		) {
			return getOptimizedExternalImage(baseSrc);
		}
		return baseSrc;
	}, [imgSrc, hasError, fallbackSrc, defaultFallback, autoOptimize]);

	return (
		<Image
			{...props}
			src={finalSrc}
			alt={alt}
			className={className}
			onError={() => {
				setHasError(true);
			}}
		/>
	);
}
