'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DepthParallax3DProps {
    imageUrl: string;
    depthMapUrl: string;
    intensity?: number;
    className?: string;
    style?: React.CSSProperties;
    alt?: string;
}

// ===========================================
// GLSL Shaders
// ===========================================

const VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    
    uniform sampler2D u_image;
    uniform sampler2D u_depthMap;
    uniform vec2 u_mouse;
    uniform float u_intensity;
    
    varying vec2 v_texCoord;
    
    void main() {
        // Read depth value (0 = far, 1 = near)
        float depth = texture2D(u_depthMap, v_texCoord).r;
        
        // Displace pixels based on depth and mouse position
        vec2 displacement = u_mouse * depth * u_intensity;
        
        // Sample with offset and slight edge darkening for depth illusion
        vec2 uv = v_texCoord + displacement;
        
        // Clamp UV to avoid wrapping artifacts
        uv = clamp(uv, 0.005, 0.995);
        
        vec4 color = texture2D(u_image, uv);
        
        // Subtle vignette from depth for added dimension
        float vignette = 1.0 - depth * 0.08;
        color.rgb *= vignette;
        
        gl_FragColor = color;
    }
`;

// ===========================================
// Image loader helper
// ===========================================

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ===========================================
// Component
// ===========================================

export const DepthParallax3D: React.FC<DepthParallax3DProps> = ({
    imageUrl,
    depthMapUrl,
    intensity = 0.04,
    className = '',
    style = {},
    alt = 'Property image with 3D effect',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const rafRef = useRef<number>(0);
    const mouseTarget = useRef({ x: 0, y: 0 });
    const mouseCurrent = useRef({ x: 0, y: 0 });
    const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
    const [isReady, setIsReady] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    // Create shader
    const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }, []);

    // Create program
    const createProgram = useCallback((gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) => {
        const program = gl.createProgram();
        if (!program) return null;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }, []);

    // Create texture from image
    const createTexture = useCallback((gl: WebGLRenderingContext, img: HTMLImageElement) => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        return tex;
    }, []);

    // Initialize WebGL
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let gl: WebGLRenderingContext | null = null;

        const init = async () => {
            try {
                gl = canvas.getContext('webgl', {
                    alpha: false,
                    antialias: false,
                    premultipliedAlpha: false,
                }) || canvas.getContext('experimental-webgl') as WebGLRenderingContext;

                if (!gl) {
                    setHasFailed(true);
                    return;
                }
                glRef.current = gl;

                // Compile shaders
                const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
                const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
                if (!vs || !fs) { setHasFailed(true); return; }

                const program = createProgram(gl, vs, fs);
                if (!program) { setHasFailed(true); return; }
                programRef.current = program;
                gl.useProgram(program);

                // Setup quad geometry (two triangles covering viewport)
                const positions = new Float32Array([
                    -1, -1, 1, -1, -1, 1,
                    -1, 1, 1, -1, 1, 1,
                ]);
                const texCoords = new Float32Array([
                    0, 1, 1, 1, 0, 0,
                    0, 0, 1, 1, 1, 0,
                ]);

                // Position buffer
                const posBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
                const posLoc = gl.getAttribLocation(program, 'a_position');
                gl.enableVertexAttribArray(posLoc);
                gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

                // Texcoord buffer
                const texBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
                const texLoc = gl.getAttribLocation(program, 'a_texCoord');
                gl.enableVertexAttribArray(texLoc);
                gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

                // Load images in parallel
                const [originalImg, depthImg] = await Promise.all([
                    loadImage(imageUrl),
                    loadImage(depthMapUrl),
                ]);

                // Set canvas size to match image aspect ratio
                const container = containerRef.current;
                if (container) {
                    canvas.width = container.clientWidth * (window.devicePixelRatio || 1);
                    canvas.height = container.clientHeight * (window.devicePixelRatio || 1);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }

                // Create textures
                gl.activeTexture(gl.TEXTURE0);
                createTexture(gl, originalImg);
                gl.activeTexture(gl.TEXTURE1);
                createTexture(gl, depthImg);

                // Set uniforms
                uniformsRef.current = {
                    u_image: gl.getUniformLocation(program, 'u_image'),
                    u_depthMap: gl.getUniformLocation(program, 'u_depthMap'),
                    u_mouse: gl.getUniformLocation(program, 'u_mouse'),
                    u_intensity: gl.getUniformLocation(program, 'u_intensity'),
                };

                gl.uniform1i(uniformsRef.current.u_image, 0);
                gl.uniform1i(uniformsRef.current.u_depthMap, 1);
                gl.uniform1f(uniformsRef.current.u_intensity, intensity);
                gl.uniform2f(uniformsRef.current.u_mouse, 0, 0);

                setIsReady(true);
            } catch (err) {
                console.error('DepthParallax3D init error:', err);
                setHasFailed(true);
            }
        };

        init();

        return () => {
            if (gl && programRef.current) {
                gl.deleteProgram(programRef.current);
            }
        };
    }, [imageUrl, depthMapUrl, intensity, createShader, createProgram, createTexture]);

    // Render loop
    useEffect(() => {
        if (!isReady) return;

        const render = () => {
            const gl = glRef.current;
            if (!gl) return;

            // Smooth mouse interpolation
            mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.08;
            mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.08;

            gl.uniform2f(
                uniformsRef.current.u_mouse,
                mouseCurrent.current.x,
                mouseCurrent.current.y
            );

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);

        return () => cancelAnimationFrame(rafRef.current);
    }, [isReady]);

    // Mouse events
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseTarget.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseTarget.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        };

        const onMouseLeave = () => {
            mouseTarget.current.x = 0;
            mouseTarget.current.y = 0;
        };

        // Gyroscope for mobile
        const onOrientation = (e: DeviceOrientationEvent) => {
            if (window.innerWidth >= 768) return;
            mouseTarget.current.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
            mouseTarget.current.y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45));
        };

        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        if (window.innerWidth < 768) {
            window.addEventListener('deviceorientation', onOrientation);
        }

        return () => {
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('deviceorientation', onOrientation);
        };
    }, []);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            const gl = glRef.current;
            if (!canvas || !container || !gl) return;

            canvas.width = container.clientWidth * (window.devicePixelRatio || 1);
            canvas.height = container.clientHeight * (window.devicePixelRatio || 1);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fallback: show static image if WebGL fails
    if (hasFailed) {
        return (
            <div className={className} style={style}>
                <img
                    src={imageUrl}
                    alt={alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'crosshair',
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    opacity: isReady ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                }}
            />

            {/* Loading shimmer while WebGL initializes */}
            {!isReady && !hasFailed && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer3d 1.5s infinite linear',
                }}>
                    <img
                        src={imageUrl}
                        alt={alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                    />
                </div>
            )}

            {/* 3D indicator badge */}
            {isReady && (
                <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    right: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: 'var(--gold-400, #D4AF37)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    pointerEvents: 'none',
                }}>
                    <span style={{ fontSize: '0.8rem' }}>✦</span> 3D VIEW
                </div>
            )}

            <style jsx>{`
                @keyframes shimmer3d {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};
