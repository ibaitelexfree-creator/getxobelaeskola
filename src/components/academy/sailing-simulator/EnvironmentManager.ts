import {
	BackSide,
	Color,
	DoubleSide,
	Mesh,
	PlaneGeometry,
	type Scene,
	ShaderMaterial,
	SphereGeometry,
} from "three";

export class EnvironmentManager {
	private water: Mesh;
	private sky: Mesh;

	constructor(scene: Scene) {
		// Water
		const waterGeometry = new PlaneGeometry(1000, 1000, 100, 100);
		const waterMaterial = new ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color(0x004488) },
			},
			vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;

                void main() {
                    vUv = uv;
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    
                    float elevation = sin(modelPosition.x * 0.05 + uTime) *
                                     cos(modelPosition.z * 0.05 + uTime) * 1.5;
                    
                    modelPosition.y += elevation;
                    vElevation = elevation;

                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;
                }
            `,
			fragmentShader: `
                uniform vec3 uColor;
                varying float vElevation;
                
                void main() {
                    float mixStrength = (vElevation + 1.5) / 3.0;
                    vec3 color = mix(uColor * 0.8, uColor * 1.5, mixStrength);
                    gl_FragColor = vec4(color, 0.9);
                }
            `,
			transparent: true,
			side: DoubleSide,
		});

		this.water = new Mesh(waterGeometry, waterMaterial);
		this.water.rotation.x = -Math.PI / 2;
		this.water.receiveShadow = true;
		scene.add(this.water);

		// Sky
		const skyGeometry = new SphereGeometry(1000, 32, 32);
		const skyMaterial = new ShaderMaterial({
			side: BackSide,
			uniforms: {
				topColor: { value: new Color(0x0077ff) },
				bottomColor: { value: new Color(0xffffff) },
				offset: { value: 33 },
				exponent: { value: 0.6 },
			},
			vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
			fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
		});
		this.sky = new Mesh(skyGeometry, skyMaterial);
		scene.add(this.sky);
	}

	update(time: number) {
		if (this.water.material instanceof ShaderMaterial) {
			this.water.material.uniforms.uTime.value = time;
		}
	}
}
