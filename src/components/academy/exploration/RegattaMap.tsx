"use client";

import React, { useEffect, useRef } from "react";
import {
	MapContainer,
	Marker,
	Polyline,
	Popup,
	TileLayer,
	useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface RegattaMapProps {
	route: [number, number][];
	currentStep: number;
}

// Component to handle map view updates
function MapController({
	route,
	currentStep,
}: {
	route: [number, number][];
	currentStep: number;
}) {
	const map = useMap();
	const prevRouteRef = useRef<[number, number][] | null>(null);

	useEffect(() => {
		// Fix Leaflet icons
		// This is needed because of how webpack handles image imports for Leaflet
		delete (L.Icon.Default.prototype as any)._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl:
				"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
			iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
			shadowUrl:
				"https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
		});
	}, []);

	useEffect(() => {
		// Check if route has changed (by reference or length/start point)
		const isNewRoute = prevRouteRef.current !== route;

		if (isNewRoute && route.length > 0) {
			const bounds = L.latLngBounds(route);
			map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
			prevRouteRef.current = route;
		}
	}, [route, map]);

	useEffect(() => {
		const position = route[currentStep];
		if (position) {
			// Pan to boat, but keep zoom level unless it's initial load handled above
			// Use panTo for smooth animation
			map.panTo(position, { animate: true, duration: 0.5 });
		}
	}, [currentStep, route, map]);

	return null;
}

export default function RegattaMap({ route, currentStep }: RegattaMapProps) {
	const boatIcon = L.divIcon({
		html: '<div style="font-size: 24px; line-height: 1; filter: drop-shadow(0 0 4px rgba(0,0,0,0.5)); transform: translate(-50%, -50%);">⛵</div>',
		className: "bg-transparent border-none",
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	});

	const position = route[currentStep] || route[0] || [0, 0];
	const travelledPath = route.slice(0, currentStep + 1);
	const remainingPath = route.slice(currentStep);

	return (
		<MapContainer
			center={[20, 0]}
			zoom={2}
			className="w-full h-full"
			style={{ background: "#000510" }}
			scrollWheelZoom={true}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
			/>

			<Polyline
				positions={travelledPath}
				pathOptions={{ color: "#4ade80", weight: 3, opacity: 0.8 }}
			/>

			<Polyline
				positions={remainingPath}
				pathOptions={{
					color: "#ffffff",
					weight: 2,
					opacity: 0.3,
					dashArray: "5, 10",
				}}
			/>

			<Marker position={position} icon={boatIcon}>
				<Popup>Posición Actual</Popup>
			</Marker>

			<MapController route={route} currentStep={currentStep} />
		</MapContainer>
	);
}
