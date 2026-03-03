"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiUrl } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import GoogleAuthButton from "./GoogleAuthButton";

export default function RegisterForm() {
	const t = useTranslations("auth_form");
	const tv = useTranslations("validation");

	const registerSchema = z.object({
		nombre: z.string().min(2, tv("name_short")),
		apellidos: z.string().min(2, tv("last_name_short")),
		email: z.string().email(tv("email_invalid")),
		password: z.string().min(6, tv("password_short")),
		subscribeNewsletter: z.boolean(),
	});

	type RegisterValues = z.infer<typeof registerSchema>;

	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
	const [resendStatus, setResendStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const router = useRouter();
	const supabase = createClient();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			subscribeNewsletter: true,
		},
	});

	const emailValue = watch("email");

	const handleResendEmail = async () => {
		if (!emailValue) return;
		setResendStatus("loading");
		const { error } = await supabase.auth.resend({
			type: "signup",
			email: emailValue,
		});
		if (error) {
			setResendStatus("error");
		} else {
			setResendStatus("success");
		}
	};

	const onSubmit = async (data: RegisterValues) => {
		setLoading(true);
		setError(null);

		const locale = window.location.pathname.split("/")[1] || "es";
		const appUrl =
			process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
			window.location.origin;
		const { error: authError } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				emailRedirectTo: `${appUrl}/api/auth/callback?next=/${locale}/student/dashboard`,
				data: {
					nombre: data.nombre,
					apellidos: data.apellidos,
				},
			},
		});

		if (authError) {
			const msg = authError.message.toLowerCase();
			if (
				msg.includes("email not confirmed") ||
				(msg.includes("invalid") && msg.includes("address"))
			) {
				setError(t("email_not_confirmed"));
				setIsEmailNotConfirmed(true);
			} else if (msg.includes("rate limit")) {
				setError(t("rate_limit"));
				setIsEmailNotConfirmed(false);
			} else {
				setError(authError.message);
				setIsEmailNotConfirmed(false);
			}
			setLoading(false);
		} else {
			// Background newsletter subscription if checked
			if (data.subscribeNewsletter) {
				try {
					const locale = window.location.pathname.split("/")[1] || "es";
					await fetch(apiUrl("/api/newsletter/subscribe"), {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email: data.email, locale }),
					});
				} catch (err) {
					console.error("Background newsletter sub error:", err);
				}
			}

			const locale = window.location.pathname.split("/")[1] || "es";
			const searchParams = new URLSearchParams(window.location.search);
			const returnTo = searchParams.get("returnTo");
			router.push(
				`/${locale}/auth/login?registered=true${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`,
			);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 animate-fade-in"
		>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">
						{t("name")}
					</label>
					<input
						{...register("nombre")}
						className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
						placeholder="Ana"
					/>
					{errors.nombre && (
						<p className="text-3xs text-red-500 uppercase mt-1">
							{errors.nombre.message}
						</p>
					)}
				</div>
				<div className="space-y-1">
					<label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">
						{t("apellidos") || "Apellidos"}
					</label>
					<input
						{...register("apellidos")}
						className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
						placeholder="López"
					/>
					{errors.apellidos && (
						<p className="text-3xs text-red-500 uppercase mt-1">
							{errors.apellidos.message}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-1">
				<label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">
					{t("email")}
				</label>
				<input
					{...register("email")}
					type="email"
					className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
					placeholder="tu@email.com"
				/>
				{errors.email && (
					<p className="text-3xs text-red-500 uppercase mt-1">
						{errors.email.message}
					</p>
				)}
			</div>

			<div className="space-y-1">
				<label className="text-3xs uppercase tracking-[0.2em] text-accent font-bold ml-1">
					{t("password")}
				</label>
				<input
					{...register("password")}
					type={showPassword ? "text" : "password"}
					className="w-full bg-transparent border-b border-white/10 p-4 outline-none focus:border-accent transition-colors font-light text-sea-foam"
					placeholder="••••••••"
				/>
				{errors.password && (
					<p className="text-3xs text-red-500 uppercase mt-1">
						{errors.password.message}
					</p>
				)}

				<div className="flex items-center space-x-2 mt-2 ml-1">
					<input
						type="checkbox"
						id="show-password"
						checked={showPassword}
						onChange={(e) => setShowPassword(e.target.checked)}
						className="w-3 h-3 rounded border-white/10 bg-transparent text-accent focus:ring-accent accent-accent cursor-pointer"
					/>
					<label
						htmlFor="show-password"
						className="text-[9px] uppercase tracking-widest text-foreground/40 cursor-pointer hover:text-accent transition-colors"
					>
						{t("show_password")}
					</label>
				</div>
			</div>

			<div className="flex items-center gap-3 pt-2">
				<input
					{...register("subscribeNewsletter")}
					type="checkbox"
					id="subscribeNewsletter"
					className="w-4 h-4 accent-accent border-white/10 rounded-sm cursor-pointer"
				/>
				<label
					htmlFor="subscribeNewsletter"
					className="text-3xs uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer select-none"
				>
					{t("newsletter_checkbox")}
				</label>
			</div>

			{error && (
				<div className="space-y-3">
					<p className="text-2xs text-red-500 text-center leading-relaxed">
						{error}
						{isEmailNotConfirmed && (
							<button
								type="button"
								onClick={handleResendEmail}
								disabled={resendStatus === "loading"}
								className="ml-2 text-blue-500 underline hover:text-blue-400 transition-colors font-bold inline-block"
							>
								{resendStatus === "loading" ? "..." : t("resend_email")}
							</button>
						)}
					</p>
					{resendStatus === "success" && (
						<p className="text-[10px] text-green-500 text-center uppercase tracking-widest animate-fade-in">
							{t("resend_success")}
						</p>
					)}
				</div>
			)}

			<button
				disabled={loading}
				className="w-full btn mt-8 disabled:opacity-50"
			>
				{loading ? t("registering") : t("register_btn")}
			</button>

			<div className="relative my-8">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-white/10"></div>
				</div>
				<div className="relative flex justify-center text-[10px] uppercase tracking-widest">
					<span className="bg-nautical-black px-4 text-white/40 font-bold italic">
						O BIEN
					</span>
				</div>
			</div>

			<GoogleAuthButton />
		</form>
	);
}
