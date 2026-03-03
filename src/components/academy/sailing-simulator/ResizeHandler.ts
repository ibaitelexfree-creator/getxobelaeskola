import type { PerspectiveCamera, WebGLRenderer } from "three";

export class ResizeHandler {
	static handleResize(
		container: HTMLElement,
		renderer: WebGLRenderer,
		camera: PerspectiveCamera,
	) {
		const width = container.clientWidth;
		const height = container.clientHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height, false);
	}

	static observe(
		container: HTMLElement,
		renderer: WebGLRenderer,
		camera: PerspectiveCamera,
	): () => void {
		const resizeObserver = new ResizeObserver(() => {
			ResizeHandler.handleResize(container, renderer, camera);
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}
}
