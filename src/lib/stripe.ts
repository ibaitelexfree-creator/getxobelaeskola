import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2024-06-20" as any, // Latest stable for this major version
	typescript: true,
	appInfo: {
		name: "Getxo Sailing School",
		version: "0.1.0",
	},
});
