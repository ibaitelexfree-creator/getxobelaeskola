"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface Waypoint {
	id: string;
	lat: number;
	lng: number;
}

interface MapProps {
	waypoints: Waypoint[];
	onMapClick: (lat: number, lng: number) => void;
}

export default function Map({ waypoints, onMapClick }: MapProps) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<L.Map | null>(null);
	const markersRef = useRef<(L.Marker | L.CircleMarker)[]>([]);
	const polylineRef = useRef<L.Polyline | null>(null);

	// Keep the latest callback in a ref to avoid stale closures in the map event listener
	const onMapClickRef = useRef(onMapClick);
	useEffect(() => {
		onMapClickRef.current = onMapClick;
	}, [onMapClick]);

	// Initialize Map
	useEffect(() => {
		if (!mapContainerRef.current) return;

		// If map already exists, don't re-initialize
		if (mapInstanceRef.current) return;

		const map = L.map(mapContainerRef.current).setView([43.345, -3.02], 12);

		// OpenStreetMap Base Layer
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19,
		}).addTo(map);

		// OpenSeaMap Overlay
		L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
			maxZoom: 19,
		}).addTo(map);

		// Click Handler using the ref
		map.on("click", (e: L.LeafletMouseEvent) => {
			if (onMapClickRef.current) {
				onMapClickRef.current(e.latlng.lat, e.latlng.lng);
			}
		});

		mapInstanceRef.current = map;

		return () => {
			// Cleanup map on unmount
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, []); // Run once on mount

	// Update Waypoints and Route
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Clear existing polyline
		if (polylineRef.current) {
			polylineRef.current.remove();
			polylineRef.current = null;
		}

		// Add new markers
		waypoints.forEach((wp, index) => {
			const marker = L.circleMarker([wp.lat, wp.lng], {
				radius: 6,
				fillColor: "#FF4D00", // brand.buoy-orange
				color: "#fff",
				weight: 2,
				opacity: 1,
				fillOpacity: 0.8,
			}).addTo(map);

			marker.bindPopup(
				`Waypoint ${index + 1}<br>Lat: ${wp.lat.toFixed(4)}<br>Lng: ${wp.lng.toFixed(4)}`,
			);
			markersRef.current.push(marker);
		});

		// Add polyline if > 1 waypoint
		if (waypoints.length > 1) {
			const latlngs = waypoints.map(
				(wp) => [wp.lat, wp.lng] as [number, number],
			);
			const polyline = L.polyline(latlngs, {
				color: "#154FA3", // brand.nautical.blue
				weight: 3,
				dashArray: "5, 10",
			}).addTo(map);
			polylineRef.current = polyline;
		}
	}, [waypoints]);

	return (
		<div
			ref={mapContainerRef}
			className="w-full h-full z-0 relative outline-none"
			style={{ minHeight: "600px", height: "100%" }}
		/>
	);
}
