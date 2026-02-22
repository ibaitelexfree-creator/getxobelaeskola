import {
	AmbientLight,
	Color,
	DirectionalLight,
	HemisphereLight,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";

export interface RendererContext {
	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGLRenderer;
}

export class RendererSetup {
	static create(
		canvas: HTMLCanvasElement | OffscreenCanvas,
		width: number,
		height: number,
		pixelRatio: number,
	): RendererContext {
		const scene = new Scene();
		scene.background = new Color(0x87ceeb); // Light blue sky color

		const camera = new PerspectiveCamera(75, width / height, 0.1, 2000);
		camera.position.set(0, 10, 20);
		camera.lookAt(0, 0, 0);

		const renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
		});
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height, false);
		renderer.shadowMap.enabled = true;

		// Base Lighting
		const ambientLight = new AmbientLight(0xffffff, 0.6); // Soft white light
		scene.add(ambientLight);

		const sunLight = new DirectionalLight(0xffffff, 1.0);
		sunLight.position.set(100, 100, 50);
		sunLight.castShadow = true;
		scene.add(sunLight);

		const hemisphereLight = new HemisphereLight(0x87ceeb, 0x001133, 0.5); // Sky/Water contrast
		scene.add(hemisphereLight);

		return { scene, camera, renderer };
	}
}
