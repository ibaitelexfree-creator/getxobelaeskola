import { useTranslations } from "next-intl";
import NauticalConverter from "@/components/tools/NauticalConverter/NauticalConverter";

export default function Page() {
	const t = useTranslations("tools.nautical_converter");

	return (
		<div className="min-h-screen bg-black pt-32 pb-12 px-4 relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-nautical-deep/50 to-transparent pointer-events-none" />
			<div className="absolute -top-[20%] right-[10%] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none" />

			<div className="max-w-4xl mx-auto space-y-8 relative z-10">
				<div className="text-center space-y-4 animate-fade-in">
					<span className="text-brand-blue font-mono text-sm tracking-[0.2em] uppercase">
						{t("eyebrow")}
					</span>
					<h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
						{t("title")}
					</h1>
					<p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
						{t("description")}
					</p>
				</div>

				<NauticalConverter />
			</div>
		</div>
	);
}
