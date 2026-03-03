import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCertificatePDF } from "@/lib/certificates/pdfGenerator";
import CertificateCard from "./CertificateCard";

// Mocks
vi.mock("lucide-react", () => ({
	Download: () => <div data-testid="download-icon" />,
	Loader2: () => <div data-testid="loader-icon" />,
	Award: () => <div data-testid="award-icon" />,
}));

vi.mock("@/lib/certificates/pdfGenerator", () => ({
	generateCertificatePDF: vi.fn().mockResolvedValue(undefined),
}));

describe("CertificateCard", () => {
	const mockCertificate = {
		id: "cert-1",
		tipo: "curso",
		numero_certificado: "GB-12345",
		fecha_emision: "2023-10-01",
		verificacion_hash: "abc-123",
		nota_final: 95,
		curso: {
			nombre_es: "Patrón de Yate",
			nombre_eu: "Yateko Patroia",
		},
		nivel_distincion: "excelencia",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render certificate info correctly", () => {
		render(
			<CertificateCard
				certificate={mockCertificate}
				studentName="Juan Perez"
				locale="es"
			/>,
		);

		expect(screen.getByText(/Patrón de Yate/)).toBeDefined();
		expect(screen.getByText(/#GB-12345/)).toBeDefined();
		expect(screen.getByText(/95%/)).toBeDefined();
	});

	it("should show level name for level type certificates", () => {
		const levelCert = {
			...mockCertificate,
			tipo: "nivel",
			curso: null,
			nivel: {
				nombre_es: "Nivel Iniciación",
				nombre_eu: "Hasierako Maila",
			},
		};
		render(
			<CertificateCard
				certificate={levelCert}
				studentName="Juan Perez"
				locale="eu"
			/>,
		);

		expect(screen.getByText(/Hasierako Maila/)).toBeDefined();
	});

	it("should trigger PDF generation on download click", async () => {
		render(
			<CertificateCard
				certificate={mockCertificate}
				studentName="Juan Perez"
				locale="es"
			/>,
		);

		const downloadBtn = screen.getByRole("button", { name: /Descargar PDF/i });
		fireEvent.click(downloadBtn);

		expect(screen.getByText(/Generando/)).toBeDefined();

		await waitFor(
			() => {
				expect(generateCertificatePDF).toHaveBeenCalledWith(
					expect.objectContaining({
						studentName: "Juan Perez",
						courseName: "Patrón de Yate",
					}),
				);
			},
			{ timeout: 3000 },
		);

		expect(screen.queryByText(/Generando/)).toBeNull();
	});

	it("should show error alert if PDF generation fails", async () => {
		const _alertMock = vi.stubGlobal("alert", vi.fn());
		(generateCertificatePDF as any).mockRejectedValue(new Error("PDF error"));

		render(
			<CertificateCard
				certificate={mockCertificate}
				studentName="Juan Perez"
				locale="es"
			/>,
		);

		fireEvent.click(screen.getByText("Descargar PDF"));

		await waitFor(() => {
			expect(alert).toHaveBeenCalledWith(
				"Error al generar el certificado. Inténtalo de nuevo.",
			);
		});
	});
});
