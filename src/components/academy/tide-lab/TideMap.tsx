"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { CurrentVector } from "@/lib/geospatial/tide-engine";

interface TideMapProps {
	currents: CurrentVector[];
}

export const TideMap: React.FC<TideMapProps> = ({ currents }) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<any>(null);
	const LRef = useRef<any>(null);
	const markersRef = useRef<Map<string, any>>(new Map());
	const initializing = useRef(false);

	// Initialize Map
	useEffect(() => {
		if (
			typeof window === "undefined" ||
			!mapRef.current ||
			mapInstance.current ||
			initializing.current
		)
			return;

		const initMap = async () => {
			if (!mapRef.current || initializing.current) return;
			initializing.current = true;

			const L = (await import("leaflet")).default;
			LRef.current = L;

			// Final check
			if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

			const map = L.map(mapRef.current, {
				zoomControl: false,
				attributionControl: false,
				dragging: false, // Lock view for demo
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false,
				keyboard: false,
			}).setView([43.345, -3.03], 13); // Centered on Abra

			L.tileLayer(
				"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
				{
					maxZoom: 19,
				},
			).addTo(map);

			mapInstance.current = map;
		};

		initMap();

		return () => {
			if (mapInstance.current) {
				mapInstance.current.remove();
				mapInstance.current = null;
			}
		};
	}, []);

	// Update Markers
	useEffect(() => {
		const map = mapInstance.current;
		const L = LRef.current;
		if (!map || !L) return;

		currents.forEach((vector) => {
			let marker = markersRef.current.get(vector.id);

			// Arrow SVG
			// Color interpolation: Blue (0) -> Cyan (0.5) -> White (1)
			// Or simpler: just Opacity.
			const opacity = 0.3 + vector.intensity * 0.7;
			const scale = 0.8 + vector.intensity * 0.4;

			// Determine color based on intensity
			const color =
				vector.intensity > 0.8
					? "#ffffff"
					: vector.intensity > 0.4
						? "#60a5fa"
						: "#3b82f6";

			const iconHtml = `
                <div style="
                    transform: rotate(${vector.rotation}deg) scale(${scale});
                    transition: all 0.5s ease-out;
                    opacity: ${opacity};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L12 22" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 2L5 9" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 2L19 9" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                        <!-- Speed lines for high intensity -->
                        ${vector.intensity > 0.6 ? `<path d="M8 14L12 10L16 14" stroke="${color}" stroke-width="1" stroke-opacity="0.5" />` : ""}
                    </svg>
                </div>
            `;

			const icon = L.divIcon({
				html: iconHtml,
				className: "bg-transparent", // Remove default white box
				iconSize: [40, 40],
				iconAnchor: [20, 20], // Center
			});

			if (marker) {
				marker.setIcon(icon);
				marker.setLatLng([vector.lat, vector.lng]); // Just in case position updates
			} else {
				marker = L.marker([vector.lat, vector.lng], { icon }).addTo(map);
				markersRef.current.set(vector.id, marker);
			}
		});
	}, [currents]);

	return (
		<div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl relative">
			<div ref={mapRef} className="w-full h-full bg-slate-950" />

			{/* Overlay Info */}
			<div className="absolute top-4 right-4 z-[400] pointer-events-none">
				<div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono">
					MAPA DE VECTORES
				</div>
			</div>
		</div>
	);
};
