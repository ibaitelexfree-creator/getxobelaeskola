"use client";

import dynamic from "next/dynamic";

const NavigationMap = dynamic(() => import("./NavigationMap"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-[600px] rounded-3xl bg-slate-900 flex items-center justify-center animate-pulse border border-slate-800">
			<div className="flex flex-col items-center gap-4">
				<div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
				<p className="text-slate-500 text-sm font-mono tracking-widest">
					CARGANDO CARTA NÁUTICA...
				</p>
			</div>
		</div>
	),
});

export default NavigationMap;
