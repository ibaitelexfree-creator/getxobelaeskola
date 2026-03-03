"use client";

import React, { useEffect, useRef } from "react";
import type { LocationPoint } from "@/hooks/useSmartTracker";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
	center: [number, number];
	mappedSessions: any[];
	livePoints: LocationPoint[];
	currentPosition: LocationPoint | null;
}

export default function LeafletMap({
	center,
	mappedSessions,
	livePoints,
	currentPosition,
}: LeafletMapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<any>(null);
	const LRef = useRef<any>(null);
	const initializing = useRef(false);

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

			// Final check on DOM element
			if (!mapRef.current || (mapRef.current as any)._leaflet_id) {
				return;
			}

			const map = L.map(mapRef.current, {
				zoomControl: false,
				attributionControl: false,
			}).setView(center || [43.35, -3.01], 13);

			L.tileLayer(
				"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
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

	// Update markers and paths
	useEffect(() => {
		const map = mapInstance.current;
		const L = LRef.current;
		if (!map || !L) return;

		// Clear previous layers (except tiles)
		map.eachLayer((layer: any) => {
			if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
				map.removeLayer(layer);
			}
		});

		// Historical sessions
		(mappedSessions || []).forEach((s) => {
			if (s.ubicacion) {
				L.circleMarker([s.ubicacion.lat, s.ubicacion.lng], {
					radius: 4,
					fillColor: "#0ea5e9",
					color: "white",
					weight: 1,
					fillOpacity: 0.8,
				})
					.addTo(map)
					.bindPopup(s.zona_nombre || "Sesión");

				if (s.track_log && Array.isArray(s.track_log)) {
					const positions = s.track_log.map((p: any) => [p.lat, p.lng]);
					L.polyline(positions, {
						color: "#0ea5e9",
						weight: 2,
						opacity: 0.4,
					}).addTo(map);
				}
			}
		});

		// Live points
		if (livePoints && livePoints.length > 1) {
			const positions = livePoints.map((p) => [p.lat, p.lng]);
			L.polyline(positions, {
				color: "#fbbf24",
				weight: 3,
				dashArray: "5, 10",
				opacity: 0.8,
			}).addTo(map);
		}

		// Current position
		if (currentPosition) {
			L.circleMarker([currentPosition.lat, currentPosition.lng], {
				radius: 6,
				fillColor: "#fbbf24",
				color: "#fbbf24",
				weight: 10,
				opacity: 0.3,
			}).addTo(map);
		}
	}, [mappedSessions, livePoints, currentPosition]);

	return (
		<div
			ref={mapRef}
			style={{ height: "100%", width: "100%", background: "#0a1628" }}
		/>
	);
}
