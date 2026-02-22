"use client";

import { Geolocation, Position } from "@capacitor/geolocation";
import { useEffect, useRef, useState } from "react";
// import { Capacitor } from '@capacitor/core';

export interface LocationPoint {
	lat: number;
	lng: number;
	timestamp: number;
}

export function useGeolocation() {
	const [isTracking, setIsTracking] = useState(false);
	const [points, setPoints] = useState<LocationPoint[]>([]);
	const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const watchId = useRef<string | null>(null);

	const startTracking = async () => {
		try {
			const { Capacitor } = await import("@capacitor/core");
			if (Capacitor.isNativePlatform()) {
				const permissions = await Geolocation.checkPermissions();
				if (permissions.location !== "granted") {
					const request = await Geolocation.requestPermissions();
					if (request.location !== "granted") {
						setError("Permiso de ubicación denegado");
						return;
					}
				}
			}

			setIsTracking(true);
			setError(null);
			setPoints([]);

			watchId.current = await Geolocation.watchPosition(
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				},
				(position, err) => {
					if (err) {
						console.error("Watch error:", err);
						setError(err.message);
						return;
					}

					if (position) {
						const newPoint: LocationPoint = {
							lat: position.coords.latitude,
							lng: position.coords.longitude,
							timestamp: position.timestamp,
						};
						setCurrentPosition(newPoint);
						setPoints((prev) => {
							// Only add if significantly different or every 10 seconds to avoid too many points
							const lastPoint = prev[prev.length - 1];
							if (
								!lastPoint ||
								newPoint.timestamp - lastPoint.timestamp > 5000
							) {
								return [...prev, newPoint];
							}
							return prev;
						});
					}
				},
			);
		} catch (err: any) {
			setError(err.message || "Error al iniciar el seguimiento");
			setIsTracking(false);
		}
	};

	const stopTracking = () => {
		if (watchId.current) {
			Geolocation.clearWatch({ id: watchId.current });
			watchId.current = null;
		}
		setIsTracking(false);
	};

	useEffect(() => {
		return () => {
			if (watchId.current) {
				Geolocation.clearWatch({ id: watchId.current });
			}
		};
	}, []);

	return {
		isTracking,
		points,
		currentPosition,
		error,
		startTracking,
		stopTracking,
		clearPoints: () => setPoints([]),
	};
}
