import dns from "node:dns";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs" && dns.setDefaultResultOrder) {
		dns.setDefaultResultOrder("ipv4first");
	}
}
