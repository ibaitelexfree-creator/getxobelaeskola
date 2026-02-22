import { NextResponse } from "next/server";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const FLEET_DB_ID = "30c31210-b1a1-813b-a949-d7ddf66d84c9";

export async function GET() {
	try {
		const res = await fetch(
			`https://api.notion.com/v1/databases/${FLEET_DB_ID}/query`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${NOTION_TOKEN}`,
					"Notion-Version": "2022-06-28",
					"Content-Type": "application/json",
				},
			},
		);

		const data = await res.json();
		const results = data.results || [];

		let totalROI = 0;
		let totalRevenue = 0;
		let totalExpenses = 0;
		let activeAlerts = 0;

		results.forEach((page: any) => {
			const props = page.properties;
			totalROI += props.ROI_Porcentaje_Auto?.formula?.number || 0;
			totalRevenue += props.Ingresos_por_Reservas?.rollup?.number || 0;
			totalRevenue += props.Ingresos_Extra_Manual?.number || 0;
			totalExpenses += props.Gastos_Mantenimiento?.number || 0;
			if (props.Alerta_Rentabilidad?.formula?.string?.includes("🚨")) {
				activeAlerts++;
			}
		});

		const avgROI =
			results.length > 0 ? (totalROI / results.length).toFixed(1) : 0;

		return NextResponse.json({
			summary: {
				avgROI,
				totalRevenue,
				totalExpenses,
				netProfit: totalRevenue - totalExpenses,
				activeAlerts,
				fleetSize: results.length,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch global metrics" },
			{ status: 500 },
		);
	}
}
