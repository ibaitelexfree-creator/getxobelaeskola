import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const ChartCanvas = dynamic(
	() => import("@/components/academy/tools/ChartPlotter/ChartCanvas"),
	{
		ssr: false,
		loading: () => (
			<div className="w-full h-screen bg-[#e0e0e0] flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-10 h-10 border-4 border-nautical-blue/20 border-t-nautical-blue rounded-full animate-spin" />
					<p className="text-nautical-black font-display italic text-sm animate-pulse">
						Desplegando Cartografía...
					</p>
				</div>
			</div>
		),
	},
);

export default function ChartPlotterPage() {
	const t = useTranslations("academy");

	return (
		<div className="w-full h-screen bg-[#e0e0e0] flex flex-col relative overflow-hidden">
			<ChartCanvas />

			{/* Header Overlay */}
			<div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full border border-black/10 shadow-xl pointer-events-none">
				<h1 className="text-sm font-display italic text-nautical-black">
					Mesa de Cartas Virtual
				</h1>
			</div>
		</div>
	);
}
