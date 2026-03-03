import { useEffect, useRef } from "react";

/**
 * Hook para atrapar el foco dentro de un elemento (Focus Trap)
 * Útil para modales y diálogos siguiendo WCAG.
 */
export function useFocusTrap(isActive: boolean) {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isActive) return;

		const root = rootRef.current;
		if (!root) return;

		// Buscar elementos con foco
		const focusableElements = root.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[
			focusableElements.length - 1
		] as HTMLElement;

		const handleTab = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement?.focus();
				}
			} else {
				// Tab
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		};

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				// El componente padre debe manejar el cierre
				const closeButton = root.querySelector(
					'[aria-label*="Cerrar"], [aria-label*="close"]',
				) as HTMLElement;
				closeButton?.click();
			}
		};

		// Foco inicial
		firstElement?.focus({ preventScroll: true });

		window.addEventListener("keydown", handleTab);
		window.addEventListener("keydown", handleEscape);

		return () => {
			window.removeEventListener("keydown", handleTab);
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isActive]);

	return rootRef;
}
