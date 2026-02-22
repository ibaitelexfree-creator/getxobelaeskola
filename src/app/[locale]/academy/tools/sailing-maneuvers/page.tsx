import type { Metadata } from "next";
import SailingManeuverPlayer from "@/components/academy/navigation/SailingManeuverPlayer";

export const metadata: Metadata = {
	title: "Player de Maniobras | Getxo Bela Eskola",
	description:
		"Visualiza y aprende paso a paso las maniobras náuticas esenciales: virada, empopada, hombre al agua y atraque.",
};

export default function SailingManeuversPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
						Player de Maniobras
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-300">
						Herramienta interactiva para visualizar paso a paso las maniobras
						fundamentales de la navegación a vela. Selecciona una maniobra,
						ajusta la velocidad y observa la evolución del barco y el trimado de
						las velas.
					</p>
				</div>

				<SailingManeuverPlayer />

				<div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700/50">
					<h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
						Instrucciones
					</h3>
					<ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
						<li>
							Selecciona la maniobra que deseas estudiar en el menú desplegable.
						</li>
						<li>
							Usa los controles de reproducción para ver la animación continua o
							paso a paso.
						</li>
						<li>
							Ajusta la velocidad de reproducción según tu nivel de comprensión.
						</li>
						<li>
							Lee atentamente la descripción de cada paso para entender los
							detalles técnicos.
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
