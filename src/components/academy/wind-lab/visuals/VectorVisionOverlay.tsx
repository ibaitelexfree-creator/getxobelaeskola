import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { DerivedPhysics } from "../physics/PhysicsEngine";

interface VectorVisionOverlayProps {
	physics: DerivedPhysics;
	visible: boolean;
}

// Helper to smooth vector values

// Actually, treating this as a pure render component with internal state animation IS better
export const VectorVisionOverlay: React.FC<VectorVisionOverlayProps> = ({
	physics,
	visible,
}) => {
	const t = useTranslations("wind_lab");
	const [_, setTick] = useState(0); // Force re-render for smooth animation?
	// No, better to use refs for the SVG elements if we want high perf,
	// BUT since we are in React, let's use a simpler approach:
	// We lift the smoothing to a small custom hook that runs a loop?
	// OR we just assume physics updates are 60fps?
	// Physics is 60fps. The issue is instant changes.
	// Let's implement a simple internal lerp state.

	// Internal smoothed state
	const smoothed = useRef({
		awSpeed: 0,
		driveForce: 0,
		heelForce: 0,
	});

	const requestRef = useRef<number>();
	const previousTimeRef = useRef<number>();

	const physicsRef = useRef(physics);
	useEffect(() => {
		physicsRef.current = physics;
	}, [physics]);

	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			const deltaTime = (time - previousTimeRef.current) / 1000;
			const currentPhysics = physicsRef.current;

			// Smooth factors (adjust for feel)
			const decay = 8.0;
			const alpha = 1 - Math.exp(-decay * deltaTime);

			smoothed.current.awSpeed +=
				(currentPhysics.apparentWindSpeed - smoothed.current.awSpeed) * alpha;
			smoothed.current.driveForce +=
				(Math.abs(currentPhysics.driveForce) - smoothed.current.driveForce) *
				alpha;
			smoothed.current.heelForce +=
				(currentPhysics.heelForce - smoothed.current.heelForce) * alpha;

			setTick(time); // Trigger render
		}
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		if (visible) {
			requestRef.current = requestAnimationFrame(animate);
		}
		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [visible]);

	if (!visible) return null;

	// Scaling factors
	const forceScale = 0.5;
	const windScale = 2;

	const awaRad = (physics.apparentWindAngle * Math.PI) / 180;
	const liftAngleRad =
		physics.apparentWindAngle > 0 ? awaRad - Math.PI / 2 : awaRad + Math.PI / 2;
	const dragAngleRad = awaRad + Math.PI;

	const renderArrow = (
		angleRad: number,
		magnitude: number,
		color: string,
		label: string,
	) => {
		const length = magnitude;
		const x2 = Math.sin(angleRad) * length;
		const y2 = -Math.cos(angleRad) * length;

		return (
			<g className="transition-transform duration-75">
				<line
					x1="0"
					y1="0"
					x2={x2}
					y2={y2}
					stroke={color}
					strokeWidth="3"
					strokeLinecap="round"
					className="drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]"
				/>
				<circle cx={x2} cy={y2} r="4" fill={color} />
				<text
					x={x2 * 1.2}
					y={y2 * 1.2}
					fill={color}
					fontSize="10"
					fontWeight="bold"
					textAnchor="middle"
					className="font-mono"
					style={{ textShadow: "0 0 2px black" }}
				>
					{label}
				</text>
			</g>
		);
	};

	return (
		<svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
			<g transform={`translate(${50}%, ${50}%)`}>
				{renderArrow(
					awaRad,
					smoothed.current.awSpeed * windScale,
					"#3B82F6",
					t("forces.aw"),
				)}
				{renderArrow(
					liftAngleRad,
					smoothed.current.driveForce * forceScale + 20,
					"#10B981",
					t("forces.lift"),
				)}
				{renderArrow(
					dragAngleRad,
					smoothed.current.heelForce * forceScale + 20,
					"#EF4444",
					t("forces.drag"),
				)}
			</g>
		</svg>
	);
};
