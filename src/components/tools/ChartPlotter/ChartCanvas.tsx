"use client";

import { Compass, Move, RotateCcw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import DividersTool from "./DividersTool";
import ParallelRuler from "./ParallelRuler";

interface Point {
	x: number;
	y: number;
}
interface Viewport {
	x: number;
	y: number;
	scale: number;
}

interface ChartCanvasProps {
	width?: number;
	height?: number;
}

export default function ChartCanvas({
	width = 800,
	height = 600,
}: ChartCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [lastMouse, setLastMouse] = useState<Point>({ x: 0, y: 0 });
	const [activeTool, setActiveTool] = useState<"pan" | "ruler" | "dividers">(
		"pan",
	);

	// Tool State: Parallel Ruler
	const [rulerState, setRulerState] = useState({
		x: 400,
		y: 300,
		angle: 0,
		active: false,
	});

	// Tool State: Dividers
	const [dividersState, setDividersState] = useState({
		p1: { x: 300, y: 300 },
		p2: { x: 500, y: 300 },
		active: false,
	});

	// --- Coordinate System ---
	// World coordinates (0,0) is top-left of the chart image at scale 1.
	// Screen coordinates are relative to the canvas element.

	const screenToWorld = useCallback(
		(sx: number, sy: number): Point => {
			return {
				x: (sx - viewport.x) / viewport.scale,
				y: (sy - viewport.y) / viewport.scale,
			};
		},
		[viewport],
	);

	const worldToScreen = useCallback(
		(wx: number, wy: number): Point => {
			return {
				x: wx * viewport.scale + viewport.x,
				y: wy * viewport.scale + viewport.y,
			};
		},
		[viewport],
	);

	// --- Interaction Handlers ---

	const handleWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		const zoomFactor = 1.1;
		const delta = -Math.sign(e.deltaY);
		const newScale =
			delta > 0 ? viewport.scale * zoomFactor : viewport.scale / zoomFactor;

		// Clamp scale
		if (newScale < 0.5 || newScale > 5) return;

		// Zoom towards mouse pointer
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const worldMouse = screenToWorld(mouseX, mouseY);

		const newX = mouseX - worldMouse.x * newScale;
		const newY = mouseY - worldMouse.y * newScale;

		setViewport({ x: newX, y: newY, scale: newScale });
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (activeTool === "pan") {
			setIsDragging(true);
			setLastMouse({ x: e.clientX, y: e.clientY });
		}
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging && activeTool === "pan") {
			const dx = e.clientX - lastMouse.x;
			const dy = e.clientY - lastMouse.y;
			setViewport((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
			setLastMouse({ x: e.clientX, y: e.clientY });
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// --- Rendering ---

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Clear
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw Chart (Placeholder Grid for now)
		ctx.save();
		ctx.translate(viewport.x, viewport.y);
		ctx.scale(viewport.scale, viewport.scale);

		// Draw Background
		ctx.fillStyle = "#e0f7fa"; // Light blue sea color
		ctx.fillRect(0, 0, 2000, 1500); // Assume large chart

		// Draw Grid (Lat/Long lines simulation)
		ctx.strokeStyle = "#b2ebf2";
		ctx.lineWidth = 1;
		for (let i = 0; i < 2000; i += 100) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, 1500);
			ctx.stroke();
		}
		for (let j = 0; j < 1500; j += 100) {
			ctx.beginPath();
			ctx.moveTo(0, j);
			ctx.lineTo(2000, j);
			ctx.stroke();
		}

		// Draw Land (Simple placeholder shapes)
		ctx.fillStyle = "#f9fbe7"; // Light land color
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(500, 0);
		ctx.lineTo(600, 300);
		ctx.lineTo(400, 600);
		ctx.lineTo(0, 800);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	}, [viewport, width, height]);

	return (
		<div
			className="relative border border-slate-300 rounded overflow-hidden bg-slate-100 block w-full h-[600px]"
			ref={containerRef}
		>
			{/* Toolbar */}
			<div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white/90 p-2 rounded shadow-md backdrop-blur-sm">
				<button
					onClick={() => setActiveTool("pan")}
					className={`p-2 rounded hover:bg-slate-200 ${activeTool === "pan" ? "bg-blue-100 text-blue-600" : "text-slate-600"}`}
					title="Mover Mapa (Pan)"
				>
					<Move size={20} />
				</button>
				<button
					onClick={() => setActiveTool("ruler")}
					className={`p-2 rounded hover:bg-slate-200 ${activeTool === "ruler" ? "bg-blue-100 text-blue-600" : "text-slate-600"}`}
					title="Regla Paralela"
				>
					<RotateCcw size={20} />
				</button>
				<button
					onClick={() => setActiveTool("dividers")}
					className={`p-2 rounded hover:bg-slate-200 ${activeTool === "dividers" ? "bg-blue-100 text-blue-600" : "text-slate-600"}`}
					title="Compás de Puntas"
				>
					<Compass size={20} />
				</button>
			</div>

			{/* Info Bar */}
			<div className="absolute bottom-4 left-4 z-10 bg-white/90 px-3 py-1 rounded text-2xs font-mono text-slate-600">
				Scale: {viewport.scale.toFixed(2)}x | Pos: {Math.round(viewport.x)},
				{Math.round(viewport.y)}
			</div>

			{/* Main Canvas */}
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				className={`w-full h-full cursor-${activeTool === "pan" ? (isDragging ? "grabbing" : "grab") : "crosshair"}`}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onWheel={handleWheel}
			/>

			{/* Tools Overlay (SVG Layer for crisp vectors) */}
			<svg className="absolute inset-0 pointer-events-none w-full h-full">
				{activeTool === "ruler" && (
					<ParallelRuler
						x={rulerState.x}
						y={rulerState.y}
						angle={rulerState.angle}
						scale={viewport.scale}
						worldToScreen={worldToScreen}
						screenToWorld={screenToWorld}
						onUpdate={(newState) =>
							setRulerState({ ...rulerState, ...newState })
						}
					/>
				)}
				{activeTool === "dividers" && (
					<DividersTool
						p1={dividersState.p1}
						p2={dividersState.p2}
						scale={viewport.scale}
						worldToScreen={worldToScreen}
						screenToWorld={screenToWorld}
						onUpdate={(newState) =>
							setDividersState({ ...dividersState, ...newState })
						}
					/>
				)}
			</svg>
		</div>
	);
}
