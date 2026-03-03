"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const CENTER_POSITION: [number, number] = [43.345, -3.02];
const CLUB_LOCATION: [number, number] = [43.354, -3.025];
const NAVIGATION_ROUTE: [number, number][] = [
	[43.354, -3.025],
	[43.352, -3.03],
	[43.35, -3.04],
	[43.36, -3.05],
	[43.37, -3.06],
];
const DANGER_ZONE: [number, number][] = [
	[43.356, -3.035],
	[43.358, -3.032],
	[43.357, -3.03],
	[43.355, -3.033],
];

export default function NavigationMap() {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);

	useEffect(() => {
		let isMounted = true;

		const initMap = async () => {
			if (typeof window === "undefined") return;

			// Dynamic import of Leaflet
			const L = (await import("leaflet")).default;

			if (!isMounted) return;

			// Fix icons
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
				iconUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
				shadowUrl:
					"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
			});

			if (mapRef.current && !mapInstanceRef.current) {
				const map = L.map(mapRef.current).setView(CENTER_POSITION, 13);
				mapInstanceRef.current = map;

				L.tileLayer(
					"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
					{
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
					},
				).addTo(map);

				// Club Marker
				L.marker(CLUB_LOCATION)
					.addTo(map)
					.bindPopup("<b>Getxo Bela Eskola</b><br>Puerto Deportivo");

				// Route
				L.polyline(NAVIGATION_ROUTE, {
					color: "#3b82f6",
					weight: 4,
					dashArray: "10, 10",
					opacity: 0.8,
				}).addTo(map);

				// Danger Zone
				L.polygon(DANGER_ZONE, {
					color: "#ef4444",
					fillColor: "#ef4444",
					fillOpacity: 0.2,
					weight: 2,
				})
					.addTo(map)
					.bindPopup("Zona Peligrosa: Bajos");

				// Waypoints
				const waypoints = [
					{
						pos: [43.352, -3.03],
						title: "Salida del Puerto",
						desc: "Canal de navegación principal.",
					},
					{
						pos: [43.36, -3.05],
						title: "Boyas de Regata",
						desc: "Zona habitual de entrenamiento.",
					},
					{
						pos: [43.356, -3.033],
						title: "Bajos de Arrigunaga",
						desc: "Peligro: Rocas sumergidas.",
					},
				];

				waypoints.forEach((wp) => {
					L.marker(wp.pos as [number, number])
						.addTo(map)
						.bindPopup(`<b>${wp.title}</b><br>${wp.desc}`);
				});
			}
		};

		initMap();

		return () => {
			isMounted = false;
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, []);

	return (
		<div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
			<div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl max-w-xs">
				<h3 className="text-white font-bold flex items-center gap-2">
					<MapPin className="text-blue-400 w-5 h-5" />
					Carta de Navegación
				</h3>
				<p className="text-slate-400 text-xs mt-1">
					Ría de Bilbao & Abra Exterior
				</p>
			</div>
			<div ref={mapRef} className="w-full h-full z-0" />
		</div>
	);
}
