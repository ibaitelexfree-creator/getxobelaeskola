"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ locale }: { locale: string }) {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			const res = await fetch(`/api/auth/logout?locale=${locale}`, {
				method: "POST",
			});
			const data = await res.json();
			if (data.redirect) {
				router.push(data.redirect);
				router.refresh();
			}
		} catch (error) {
			console.error("Logout failed", error);
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="text-3xs uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors block w-full text-left mt-4 pt-4 border-t border-white/5"
		>
			Cerrar Sesión
		</button>
	);
}
