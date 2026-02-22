/**
 * Definiciones de tipos para el sistema de analíticas de Getxo Sailing School.
 * Anticipa la integración con proveedores como Google Analytics, Vercel Analytics o PostHog.
 */

export interface AnalyticsEvent {
	/** Nombre del evento (ej: 'course_started', 'payment_completed') */
	name: string;
	/** Propiedades adicionales del evento */
	properties?: Record<string, string | number | boolean | null>;
	/** Timestamp opcional, por defecto es Date.now() */
	timestamp?: number;
}

export interface UserTraits {
	/** ID del usuario en el sistema */
	userId: string;
	/** Correo electrónico para identificación */
	email: string;
	/** Atributos del perfil (ej: 'gold_member', 'last_course_id') */
	traits?: Record<string, string | number | boolean | null>;
}

export interface IAnalyticsProvider {
	/** Inicializa el proveedor con sus claves correspondientes */
	init(): void;
	/** Registra un evento de acción del usuario */
	track(event: AnalyticsEvent): void;
	/** Identifica al usuario actual para el tracking session-based */
	identify(user: UserTraits): void;
	/** Limpia la sesión del usuario (ej: al hacer logout) */
	reset(): void;
}

/**
 * Eventos predefinidos para la academia online
 */
export type AcademyEvent =
	| { name: "unit_view"; properties: { unitId: string; courseId: string } }
	| {
			name: "quiz_attempt";
			properties: { quizId: string; score: number; passed: boolean };
	  }
	| {
			name: "certificate_download";
			properties: { courseId: string; certificateId: string };
	  };

/**
 * Eventos de negocio y conversión
 */
export type BusinessEvent =
	| {
			name: "checkout_start";
			properties: { productId: string; type: "course" | "rental" };
	  }
	| {
			name: "purchase_success";
			properties: { amount: number; currency: string; orderId: string };
	  }
	| { name: "newsletter_signup"; properties: { source: string } };
