import type React from "react";
import { useEffect, useState } from "react";

interface ParallelRulerProps {
	x: number;
	y: number;
	angle: number;
	scale: number;
	onUpdate: (newState: { x: number; y: number; angle: number }) => void;
	worldToScreen: (x: number, y: number) => { x: number; y: number };
	screenToWorld: (x: number, y: number) => { x: number; y: number };
}

export default function ParallelRuler({
	x,
	y,
	angle,
	scale,
	onUpdate,
	worldToScreen,
	screenToWorld,
}: ParallelRulerProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isRotating, setIsRotating] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [startAngle, setStartAngle] = useState(0);

	const screenPos = worldToScreen(x, y);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		const screenMouse = { x: e.clientX, y: e.clientY };
		setDragOffset({
			x: screenMouse.x - screenPos.x,
			y: screenMouse.y - screenPos.y,
		});
		setIsDragging(true);
	};

	const handleRotateDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		const rect = (e.target as Element).getBoundingClientRect();
		// Calculate center of ruler on screen
		// const centerX = rect.left + rect.width / 2; // Approximation
		// const centerY = rect.top + rect.height / 2;

		// This is tricky inside an SVG transform.
		// Simpler approach: Store initial mouse angle relative to ruler center (screenPos)
		const dx = e.clientX - screenPos.x;
		const dy = e.clientY - screenPos.y;
		setStartAngle(Math.atan2(dy, dx) * (180 / Math.PI) - angle);
		setIsRotating(true);
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging) {
				const newScreenX = e.clientX - dragOffset.x;
				const newScreenY = e.clientY - dragOffset.y;
				const newWorld = screenToWorld(newScreenX, newScreenY);
				// const worldMouse = screenToWorld(e.clientX, e.clientY);
				onUpdate({ x: newWorld.x, y: newWorld.y, angle });
			} else if (isRotating) {
				const dx = e.clientX - screenPos.x;
				const dy = e.clientY - screenPos.y;
				const mouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);
				onUpdate({ x, y, angle: mouseAngle - startAngle });
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsRotating(false);
		};

		if (isDragging || isRotating) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		isDragging,
		isRotating,
		dragOffset,
		startAngle,
		onUpdate,
		x,
		y,
		angle,
		screenToWorld,
		screenPos.x,
		screenPos.y,
	]);

	// Visual dimensions in pixels (unscaled or scaled? Usually tools stay constant size on screen or scale with map?)
	// Real parallel rulers scale with the map if they are physical objects on it.
	// Let's make it fixed screen size for better usability, or scaled world size?
	// "Manipulative materials" usually implies "real size" relative to the chart.
	// Let's assume a standard size in World Units. e.g. 300 units wide.
	const width = 300 * scale;
	const height = 60 * scale;

	return (
		<g transform={`translate(${screenPos.x}, ${screenPos.y}) rotate(${angle})`}>
			{/* Top Ruler */}
			<rect
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height / 2 - 2}
				fill="rgba(255, 255, 255, 0.6)"
				stroke="#333"
				strokeWidth="1"
				className="cursor-move"
				onMouseDown={handleMouseDown}
			/>
			{/* Bottom Ruler */}
			<rect
				x={-width / 2}
				y={2}
				width={width}
				height={height / 2 - 2}
				fill="rgba(255, 255, 255, 0.6)"
				stroke="#333"
				strokeWidth="1"
				className="cursor-move"
				onMouseDown={handleMouseDown}
			/>
			{/* Linkages (Visual) */}
			<line
				x1={-width / 3}
				y1={-height / 2 + 5}
				x2={-width / 4}
				y2={height / 2 - 5}
				stroke="#666"
				strokeWidth="2"
			/>
			<line
				x1={width / 4}
				y1={-height / 2 + 5}
				x2={width / 3}
				y2={height / 2 - 5}
				stroke="#666"
				strokeWidth="2"
			/>

			{/* Rotation Handle (Right Side) */}
			<circle
				cx={width / 2 + 10}
				cy={0}
				r={10}
				fill="orange"
				cursor="ew-resize"
				onMouseDown={handleRotateDown}
			/>

			{/* Angle Text */}
			<text
				x="0"
				y="5"
				textAnchor="middle"
				fontSize={12 * scale}
				fill="#333"
				pointerEvents="none"
				style={{ userSelect: "none" }}
			>
				{Math.round(angle)}°
			</text>
		</g>
	);
}
