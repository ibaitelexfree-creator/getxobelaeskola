import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import React from "react";

// Styles matching the previous jsPDF implementation
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#fffbeb", // amber-50
		padding: 0,
	},
	borderContainer: {
		margin: 10,
		borderWidth: 1,
		borderColor: "#ca8a04", // yellow-600
		flexGrow: 1,
		padding: 2,
	},
	innerBorder: {
		borderWidth: 0.5,
		borderColor: "#ca8a04",
		flexGrow: 1,
		padding: 20,
		position: "relative",
	},
	// Decorative Corners (Simplified as squares for PDF)
	cornerTL: {
		position: "absolute",
		top: 0,
		left: 0,
		width: 15,
		height: 15,
		backgroundColor: "#ca8a04",
	},
	cornerTR: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 15,
		height: 15,
		backgroundColor: "#ca8a04",
	},
	cornerBL: {
		position: "absolute",
		bottom: 0,
		left: 0,
		width: 15,
		height: 15,
		backgroundColor: "#ca8a04",
	},
	cornerBR: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 15,
		height: 15,
		backgroundColor: "#ca8a04",
	},

	header: {
		marginTop: 40,
		textAlign: "center",
	},
	title: {
		fontSize: 40,
		fontFamily: "Helvetica-Bold",
		color: "#1e3a8a", // blue-900
		textAlign: "center",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 14,
		fontFamily: "Helvetica",
		color: "#64748b", // slate-500
		textAlign: "center",
		marginBottom: 20,
	},
	studentName: {
		fontSize: 36,
		fontFamily: "Times-BoldItalic",
		color: "#000000",
		textAlign: "center",
		marginBottom: 5,
	},
	separator: {
		borderBottomWidth: 0.5,
		borderBottomColor: "#ca8a04",
		width: 200,
		alignSelf: "center",
		marginBottom: 20,
	},
	courseText: {
		fontSize: 14,
		fontFamily: "Helvetica",
		color: "#64748b",
		textAlign: "center",
		marginBottom: 5,
	},
	courseName: {
		fontSize: 24,
		fontFamily: "Helvetica-Bold",
		color: "#1e3a8a",
		textAlign: "center",
		marginBottom: 15,
	},
	detailsContainer: {
		marginTop: 10,
		alignItems: "center",
	},
	detailsText: {
		fontSize: 12,
		fontFamily: "Helvetica",
		color: "#64748b",
		textAlign: "center",
	},
	distinction: {
		fontSize: 14,
		fontFamily: "Helvetica-Bold",
		color: "#ca8a04",
		textAlign: "center",
		marginBottom: 5,
	},
	footer: {
		position: "absolute",
		bottom: 20,
		left: 20,
		width: 150,
	},
	qrContainer: {
		alignItems: "center",
	},
	qrImage: {
		width: 80,
		height: 80,
	},
	qrText: {
		fontSize: 8,
		color: "#1e3a8a",
		marginTop: 2,
		textAlign: "center",
		fontFamily: "Helvetica",
	},
	signaturesContainer: {
		flexDirection: "row",
		justifyContent: "center",
		width: "100%",
		marginTop: 50,
		marginBottom: 20,
	},
	signatureBox: {
		width: 200,
		alignItems: "center",
		marginHorizontal: 20,
	},
	signatureLine: {
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
		width: 150,
		marginBottom: 5,
	},
	signatureName: {
		fontSize: 10,
		fontFamily: "Helvetica",
		color: "#000000",
	},
	signatureTitle: {
		fontSize: 8,
		fontFamily: "Helvetica",
		color: "#64748b",
	},
	watermark: {
		position: "absolute",
		bottom: 40,
		right: 40,
		fontSize: 60,
		color: "#e5e7eb", // lighter grey
		transform: "rotate(-45deg)", // Note: rotate might not work perfectly in all viewers but is supported
		opacity: 0.5,
	},
	// Pseudo-signature style
	pseudoSignature: {
		fontFamily: "Times-Italic",
		fontSize: 18,
		color: "#1e3a8a",
		marginBottom: -5,
	},
});

export interface CertificateData {
	studentName: string;
	courseName: string;
	issueDate: string;
	certificateId: string;
	verificationHash: string;
	distinction?: string;
	hours?: number;
	qrCodeUrl?: string;
	instructorName?: string;
}

export const CertificateDocument = ({ data }: { data: CertificateData }) => {
	const formattedDate = new Date(data.issueDate).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const distinctionLabel =
		data.distinction === "excellence"
			? "EXCELENCIA ACADÉMICA"
			: data.distinction === "merit"
				? "MÉRITO DISTINGUIDO"
				: null;

	return (
		<Document>
			<Page size="A4" orientation="landscape" style={styles.page}>
				<View style={styles.borderContainer}>
					<View style={styles.innerBorder}>
						{/* Corners */}
						<View style={styles.cornerTL} />
						<View style={styles.cornerTR} />
						<View style={styles.cornerBL} />
						<View style={styles.cornerBR} />

						{/* Content */}
						<View style={styles.header}>
							<Text style={styles.title}>CERTIFICADO DE LOGRO</Text>
							<Text style={styles.subtitle}>Este documento certifica que</Text>
						</View>

						<Text style={styles.studentName}>{data.studentName}</Text>
						<View style={styles.separator} />

						<Text style={styles.courseText}>
							Ha completado satisfactoriamente el curso
						</Text>
						<Text style={styles.courseName}>{data.courseName}</Text>

						<View style={styles.detailsContainer}>
							{distinctionLabel && (
								<Text style={styles.distinction}>{distinctionLabel}</Text>
							)}
							<Text style={styles.detailsText}>
								Completado el {formattedDate}
								{data.hours ? ` • ${data.hours} horas de formación` : ""}
							</Text>
						</View>

						{/* Signatures */}
						<View style={styles.signaturesContainer}>
							<View style={styles.signatureBox}>
								<Text style={styles.pseudoSignature}>Director Académico</Text>
								<View style={styles.signatureLine} />
								<Text style={styles.signatureName}>Director Académico</Text>
								<Text style={styles.signatureTitle}>Getxo Bela Eskola</Text>
							</View>
							<View style={styles.signatureBox}>
								<Text style={styles.pseudoSignature}>
									{data.instructorName || "Instructor Jefe"}
								</Text>
								<View style={styles.signatureLine} />
								<Text style={styles.signatureName}>Instructor Jefe</Text>
								<Text style={styles.signatureTitle}>Departamento de Vela</Text>
							</View>
						</View>

						{/* Footer / QR */}
						<View style={styles.footer}>
							<View style={styles.qrContainer}>
								{data.qrCodeUrl && (
									<Image src={data.qrCodeUrl} style={styles.qrImage} />
								)}
								<Text style={styles.qrText}>ID: {data.certificateId}</Text>
								<Text style={styles.qrText}>ESCANEA PARA VERIFICAR</Text>
							</View>
						</View>

						{/* Watermark */}
						{/* Rotation support in React-PDF View style is limited, we can try Text transform */}
						<Text style={styles.watermark}>GBE</Text>
					</View>
				</View>
			</Page>
		</Document>
	);
};
