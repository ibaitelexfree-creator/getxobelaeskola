import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

// No lanzamos error para no bloquear el build o el arranque dev local
// pero avisamos si no existe
if (!resendApiKey && process.env.NODE_ENV === "production") {
	console.warn(
		"⚠️ RESEND_API_KEY no configurada. Los correos no se enviarán en producción.",
	);
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_FROM_EMAIL =
	"Getxo Sailing School <onboarding@resend.dev>"; // Cambiar en producción por dominio verificado
