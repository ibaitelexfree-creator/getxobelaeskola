
'use client';

import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Color, DoubleSide, Shape, Vector2 } from 'three';
import { Float } from '@react-three/drei';

interface BoatModelProps {
    highlightId: string | null;
    onPartClick: (id: string) => void;
    onPartHover: (id: string | null) => void;
}

const SelectablePart = ({
    id,
    highlightId,
    onPartClick,
    onPartHover,
    position,
    rotation,
    scale,
    color = '#ffffff',
    opacity = 1,
    transparent = false,
    visible = true,
    children
}: any) => {
    const meshRef = useRef<any>(null);
    const [hovered, setHovered] = useState(false);

    const isSelected = highlightId === id;
    const isActive = isSelected || hovered;

    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        onPartHover(id);
    };

    const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
        // e.stopPropagation(); // Don't stop propagation here to allow underlying parts to catch hover if needed
        setHovered(false);
        onPartHover(null);
    };

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPartClick(id);
    };

    // Use a slightly emissive material for active state
    const effectiveColor = isActive ? '#34D399' : color;
    const emissive = isActive ? '#34D399' : '#000000';
    const emissiveIntensity = isActive ? 0.5 : 0;

    return (
        <mesh
            ref={meshRef}
            position={position}
            rotation={rotation}
            scale={scale}
            visible={visible}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
        >
            {children}
            <meshStandardMaterial
                color={effectiveColor}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.3}
                metalness={0.1}
                transparent={transparent}
                opacity={opacity}
                side={DoubleSide}
            />
        </mesh>
    );
};

export default function BoatModel({ highlightId, onPartClick, onPartHover }: BoatModelProps) {

    // Geometry for Sails (Triangle)
    const sailShape = new Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(0, 4);
    sailShape.lineTo(2, 0);
    sailShape.lineTo(0, 0);

    const jibShape = new Shape();
    jibShape.moveTo(0, 0);
    jibShape.lineTo(0, 3.5);
    jibShape.lineTo(-1.5, 0);
    jibShape.lineTo(0, 0);

    const spinnakerShape = new Shape();
    // Simplified curve for spinnaker
    spinnakerShape.moveTo(0, 4);
    spinnakerShape.quadraticCurveTo(1.5, 2, 1, 0);
    spinnakerShape.lineTo(-1, 0);
    spinnakerShape.quadraticCurveTo(-1.5, 2, 0, 4);

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group rotation={[0, -Math.PI / 4, 0]}> {/* Default angle */}

                {/* --- HULL & STRUCTURE --- */}

                {/* CASCO (Main Body) */}
                <SelectablePart
                    id="casco"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 0, 0]}
                    scale={[1, 0.8, 4]}
                    color="#f0f0f0"
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* CUBIERTA (Deck) - Slightly above Hull */}
                <SelectablePart
                    id="cubierta"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 0.41, 0]}
                    scale={[0.9, 0.05, 3.8]}
                    color="#d2b48c" // Wood color
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* QUILLA (Keel) */}
                <SelectablePart
                    id="quilla"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, -1, 0]}
                    scale={[0.2, 1.5, 0.8]}
                    color="#333333"
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* TIMON (Rudder) */}
                <SelectablePart
                    id="timon"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, -0.5, 1.8]}
                    scale={[0.1, 0.8, 0.4]}
                    color="#333333"
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>


                {/* --- ZONES (Hitboxes) --- */}

                {/* PROA (Bow) */}
                <SelectablePart
                    id="proa"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 0, -2]}
                    scale={[1.1, 1.1, 0.5]}
                    transparent opacity={0.1} color="#ff0000" // Debug hint: red tint if visible
                    visible={false} // Hidden hitbox
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* POPA (Stern) */}
                <SelectablePart
                    id="popa"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 0, 2]}
                    scale={[1.1, 1.1, 0.5]}
                    transparent opacity={0.1} color="#0000ff"
                    visible={false}
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* BABOR (Port) - Left side */}
                <SelectablePart
                    id="babor"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[-0.6, 0, 0]}
                    scale={[0.2, 1, 4]}
                    transparent opacity={0.1} color="#ff0000"
                    visible={false}
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* ESTRIBOR (Starboard) - Right side */}
                <SelectablePart
                    id="estribor"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0.6, 0, 0]}
                    scale={[0.2, 1, 4]}
                    transparent opacity={0.1} color="#00ff00"
                    visible={false}
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SelectablePart>


                {/* --- RIGGING --- */}

                {/* MASTIL (Mast) */}
                <SelectablePart
                    id="mastil"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 2.5, -0.5]}
                    scale={[0.1, 5, 0.1]}
                    color="#cccccc"
                >
                    <cylinderGeometry args={[1, 1, 1, 16]} />
                </SelectablePart>

                {/* BOTAVARA (Boom) */}
                <SelectablePart
                    id="botavara"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 1.2, 0.8]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[0.08, 2.5, 0.08]}
                    color="#cccccc"
                >
                    <cylinderGeometry args={[1, 1, 1, 16]} />
                </SelectablePart>

                {/* OBENQUES (Shrouds) - Simplified as thin cylinders */}
                <SelectablePart
                    id="obenques"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 2.5, -0.5]}
                >
                    {/* Left Shroud */}
                    <mesh position={[-0.5, -1, 0]} rotation={[0, 0, -0.1]} scale={[0.02, 3, 0.02]}>
                        <cylinderGeometry args={[1, 1, 1]} />
                         <meshStandardMaterial color={highlightId === 'obenques' ? '#34D399' : '#666'} />
                    </mesh>
                    {/* Right Shroud */}
                    <mesh position={[0.5, -1, 0]} rotation={[0, 0, 0.1]} scale={[0.02, 3, 0.02]}>
                        <cylinderGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={highlightId === 'obenques' ? '#34D399' : '#666'} />
                    </mesh>
                    {/* Invisible hitbox for easier selection */}
                    <mesh position={[0, -1, 0]} scale={[1.2, 3, 0.2]} visible={false}>
                        <boxGeometry />
                    </mesh>
                </SelectablePart>

                {/* ESTAY PROA (Forestay) */}
                <SelectablePart
                    id="estay_proa"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 2.5, -1.25]}
                    rotation={[0.4, 0, 0]} // Angled forward
                    scale={[0.02, 5.5, 0.02]}
                    color="#666"
                >
                    <cylinderGeometry args={[1, 1, 1]} />
                </SelectablePart>

                {/* ESTAY POPA (Backstay) */}
                <SelectablePart
                    id="estay_popa"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 2.5, 0.8]}
                    rotation={[-0.3, 0, 0]} // Angled back
                    scale={[0.02, 5.5, 0.02]}
                    color="#666"
                >
                    <cylinderGeometry args={[1, 1, 1]} />
                </SelectablePart>


                {/* --- SAILS --- */}

                {/* MAYOR (Main Sail) */}
                <SelectablePart
                    id="mayor"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 1.4, -0.4]}
                    rotation={[0, Math.PI, 0]} // Flip to face back
                    color="#ffffff"
                    transparent opacity={0.9}
                >
                    <shapeGeometry args={[sailShape]} />
                </SelectablePart>

                {/* GENOVA (Jib) */}
                <SelectablePart
                    id="genova"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 1.4, -0.6]}
                    color="#eeeeee"
                    transparent opacity={0.9}
                >
                    <shapeGeometry args={[jibShape]} />
                </SelectablePart>

                {/* SPINNAKER (Only if active or hovered?) - Let's keep it hidden unless selected/hovered to avoid clutter or just smaller */}
                <SelectablePart
                    id="spinnaker"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 2, -2]}
                    rotation={[0, 0, 0]}
                    scale={[1.5, 1.5, 1.5]}
                    color="#3b82f6"
                    transparent opacity={0.8}
                    visible={highlightId === 'spinnaker'} // Only show when selected/hovered? No, let's make it always there but maybe phantom
                >
                    <mesh position={[0, 0, 0]}>
                         <sphereGeometry args={[1, 32, 32, 0, Math.PI, 0, Math.PI]} />
                         {/* Half sphere roughly representing spinnaker */}
                    </mesh>
                </SelectablePart>


                {/* --- DECK HARDWARE (Maniobra) --- */}

                {/* DRIZA (Halyard point at top of mast) */}
                <SelectablePart
                    id="driza"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 4.8, -0.5]}
                    scale={[0.2, 0.2, 0.2]}
                    color="#fbbf24" // Gold/Yellow
                >
                    <sphereGeometry args={[1, 16, 16]} />
                </SelectablePart>

                {/* ESCOTA (Sheet - point on boom/deck) */}
                <SelectablePart
                    id="escota"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 1, 1.5]}
                    scale={[0.15, 0.15, 0.15]}
                    color="#fbbf24"
                >
                    <sphereGeometry args={[1, 16, 16]} />
                </SelectablePart>

                {/* CONTRA (Vang) */}
                <SelectablePart
                    id="contra"
                    highlightId={highlightId} onPartClick={onPartClick} onPartHover={onPartHover}
                    position={[0, 1.0, 0]}
                    rotation={[-Math.PI / 4, 0, 0]}
                    scale={[0.05, 0.8, 0.05]}
                    color="#333"
                >
                    <cylinderGeometry args={[1, 1, 1]} />
                </SelectablePart>

            </group>
        </Float>
    );
}
