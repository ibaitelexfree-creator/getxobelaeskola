import type { ThreeEvent } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import type { Group } from "three";

interface SailboatModelProps {
	onHover: (partId: string | null) => void;
}

export default function SailboatModel({ onHover }: SailboatModelProps) {
	const groupRef = useRef<Group>(null);
	const [hoveredPart, setHoveredPart] = useState<string | null>(null);

	const handlePointerOver = (e: ThreeEvent<PointerEvent>, partId: string) => {
		e.stopPropagation();
		setHoveredPart(partId);
		onHover(partId);
	};

	const handlePointerOut = () => {
		setHoveredPart(null);
		onHover(null);
	};

	const getMaterial = (partId: string, color: string) => {
		return (
			<meshStandardMaterial
				color={hoveredPart === partId ? "#facc15" : color} // Yellow on hover
				roughness={0.5}
			/>
		);
	};

	return (
		<group ref={groupRef} dispose={null} rotation={[0, -Math.PI / 4, 0]}>
			{/* HULL GROUP */}
			<group position={[0, 0, 0]}>
				{/* Main Body (Mid) */}
				<mesh position={[0, 0.5, 0]}>
					<boxGeometry args={[2.5, 1.2, 5]} />
					<meshStandardMaterial color="#cbd5e1" />
				</mesh>

				{/* Proa (Front) */}
				{/* Using a Cone for Proa */}
				<mesh
					position={[0, 0.5, 3.5]}
					rotation={[Math.PI / 2, 0, 0]}
					onPointerOver={(e) => handlePointerOver(e, "proa")}
					onPointerOut={handlePointerOut}
				>
					<cylinderGeometry args={[0.1, 1.4, 2, 4]} />
					{getMaterial("proa", "#e2e8f0")}
				</mesh>

				{/* Popa (Back) */}
				<mesh
					position={[0, 0.5, -2.8]}
					onPointerOver={(e) => handlePointerOver(e, "popa")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[2.5, 1.2, 0.8]} />
					{getMaterial("popa", "#e2e8f0")}
				</mesh>

				{/* Babor (Left Strip - Red) */}
				<mesh
					position={[-1.3, 0.5, 0]}
					onPointerOver={(e) => handlePointerOver(e, "babor")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[0.1, 0.8, 5]} />
					{getMaterial("babor", "#ef4444")}
				</mesh>

				{/* Estribor (Right Strip - Green) */}
				<mesh
					position={[1.3, 0.5, 0]}
					onPointerOver={(e) => handlePointerOver(e, "estribor")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[0.1, 0.8, 5]} />
					{getMaterial("estribor", "#22c55e")}
				</mesh>

				{/* Amura (Front Sides) */}
				{/* Visualized as slanted boxes near front */}
				<mesh
					position={[-1, 0.5, 2.8]}
					rotation={[0, -0.4, 0]}
					onPointerOver={(e) => handlePointerOver(e, "amura")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[0.1, 0.8, 1.5]} />
					{getMaterial("amura", "#94a3b8")}
				</mesh>
				<mesh
					position={[1, 0.5, 2.8]}
					rotation={[0, 0.4, 0]}
					onPointerOver={(e) => handlePointerOver(e, "amura")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[0.1, 0.8, 1.5]} />
					{getMaterial("amura", "#94a3b8")}
				</mesh>

				{/* Aleta (Back Sides) */}
				<mesh
					position={[-1.3, 0.5, -2.5]}
					onPointerOver={(e) => handlePointerOver(e, "aleta")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[0.1, 0.8, 1.5]} />
					{getMaterial("aleta", "#94a3b8")}
				</mesh>
				<mesh
					position={[1.3, 0.5, -2.5]}
					onPointerOver={(e) => handlePointerOver(e, "aleta")}
					onPointerOut={handlePointerOut}
				>
					<boxGeometry args={[0.1, 0.8, 1.5]} />
					{getMaterial("aleta", "#94a3b8")}
				</mesh>
			</group>

			{/* APPENDAGES */}
			{/* Orza (Keel) */}
			<mesh
				position={[0, -1, 0]}
				onPointerOver={(e) => handlePointerOver(e, "orza")}
				onPointerOut={handlePointerOut}
			>
				<boxGeometry args={[0.4, 2, 1.5]} />
				{getMaterial("orza", "#334155")}
			</mesh>

			{/* Timon (Rudder) */}
			<mesh
				position={[0, -0.5, -3.5]}
				onPointerOver={(e) => handlePointerOver(e, "timon")}
				onPointerOut={handlePointerOut}
			>
				<boxGeometry args={[0.2, 1.5, 0.8]} />
				{getMaterial("timon", "#334155")}
			</mesh>

			{/* RIGGING */}
			{/* Mastil (Mast) */}
			<mesh
				position={[0, 6, 1]}
				onPointerOver={(e) => handlePointerOver(e, "mastil")}
				onPointerOut={handlePointerOut}
			>
				<cylinderGeometry args={[0.15, 0.2, 12, 16]} />
				{getMaterial("mastil", "#f1f5f9")}
			</mesh>

			{/* Botavara (Boom) */}
			<mesh
				position={[0, 2, -1.5]}
				rotation={[Math.PI / 2, 0, 0]}
				onPointerOver={(e) => handlePointerOver(e, "botavara")}
				onPointerOut={handlePointerOut}
			>
				<cylinderGeometry args={[0.12, 0.12, 5, 16]} />
				{getMaterial("botavara", "#f1f5f9")}
			</mesh>

			{/* SAILS */}
			{/* Mayor (Main Sail) - Simplified as a box/plane */}
			<mesh
				position={[0, 6.5, -1.5]}
				scale={[1, 1, 1]}
				onPointerOver={(e) => handlePointerOver(e, "mayor")}
				onPointerOut={handlePointerOut}
			>
				<boxGeometry args={[0.05, 9, 4.8]} />
				{getMaterial("mayor", "#fff")}
			</mesh>

			{/* Foque (Jib) - Simplified */}
			<mesh
				position={[0, 4.5, 2.5]}
				rotation={[0.2, 0, 0]}
				onPointerOver={(e) => handlePointerOver(e, "foque")}
				onPointerOut={handlePointerOut}
			>
				{/* Triangular shape approx */}
				<boxGeometry args={[0.05, 7, 2.5]} />
				{getMaterial("foque", "#fff")}
			</mesh>

			{/* WIRES */}
			{/* Estay (Forestay) */}
			<mesh
				position={[0, 6, 3.5]}
				rotation={[0.3, 0, 0]}
				onPointerOver={(e) => handlePointerOver(e, "estay")}
				onPointerOut={handlePointerOut}
			>
				<cylinderGeometry args={[0.03, 0.03, 13]} />
				{getMaterial("estay", "#475569")}
			</mesh>

			{/* Obenques (Shrouds) */}
			<group>
				<mesh
					position={[-1.2, 5, 0.8]}
					rotation={[0, 0, -0.15]}
					onPointerOver={(e) => handlePointerOver(e, "obenques")}
					onPointerOut={handlePointerOut}
				>
					<cylinderGeometry args={[0.03, 0.03, 11]} />
					{getMaterial("obenques", "#475569")}
				</mesh>
				<mesh
					position={[1.2, 5, 0.8]}
					rotation={[0, 0, 0.15]}
					onPointerOver={(e) => handlePointerOver(e, "obenques")}
					onPointerOut={handlePointerOut}
				>
					<cylinderGeometry args={[0.03, 0.03, 11]} />
					{getMaterial("obenques", "#475569")}
				</mesh>
			</group>
		</group>
	);
}
