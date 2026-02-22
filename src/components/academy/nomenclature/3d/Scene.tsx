"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import BoatModel from "./BoatModel";

interface BoatSceneProps {
	highlightId: string | null;
	onPartClick: (id: string) => void;
	onPartHover: (id: string | null) => void;
}

export default function BoatScene({
	highlightId,
	onPartClick,
	onPartHover,
}: BoatSceneProps) {
	return (
		<div className="w-full h-full min-h-[500px] relative bg-gradient-to-b from-sky-300 to-sky-100 rounded-xl overflow-hidden">
			<Canvas camera={{ position: [5, 2, 5], fov: 45 }} shadows>
				<ambientLight intensity={0.7} />
				<spotLight
					position={[10, 10, 10]}
					angle={0.15}
					penumbra={1}
					intensity={1}
					castShadow
				/>

				<Suspense fallback={null}>
					<Environment preset="sunset" />
					<BoatModel
						highlightId={highlightId}
						onPartClick={onPartClick}
						onPartHover={onPartHover}
					/>
					<ContactShadows
						position={[0, -2, 0]}
						opacity={0.4}
						scale={20}
						blur={2.5}
						far={4}
					/>
				</Suspense>

				<OrbitControls
					minPolarAngle={0}
					maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below water
					enablePan={false}
					minDistance={3}
					maxDistance={15}
				/>
			</Canvas>

			{/* Loading / Instructions Overlay (Optional) */}
			<div className="absolute bottom-4 left-4 pointer-events-none text-black/50 text-xs select-none">
				<p>Arrastra para rotar • Zoom para acercar</p>
			</div>
		</div>
	);
}
