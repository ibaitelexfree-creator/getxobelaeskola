import {
	Document,
	Font,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import type React from "react";

// Register fonts if needed. For now using standard fonts.
// Standard fonts: Helvetica, Times-Roman, Courier

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#fffbeb", // amber-50
		padding: 0,
		width: "100%",
		height: "100%",
	},
	borderContainer: {
		margin: 10,
		border: "1px solid #ca8a04", // yellow-600
		padding: 2,
		flex: 1,
	},
	innerBorder: {
		border: "0.5px solid #ca8a04",
		flex: 1,
		padding: 20,
		position: "relative",
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
	},
	subtitle: {
		fontSize: 14,
		fontFamily: "Helvetica",
		color: "#64748b", // slate-500
		textAlign: "center",
		marginTop: 10,
	},
	studentName: {
		fontSize: 36,
		fontFamily: "Times-BoldItalic",
		color: "#000000",
		textAlign: "center",
		marginTop: 20,
		marginBottom: 5,
	},
	separator: {
		borderBottomWidth: 0.5,
		borderBottomColor: "#ca8a04",
		width: "40%",
		alignSelf: "center",
		marginBottom: 15,
	},
	courseDetails: {
		fontSize: 14,
		fontFamily: "Helvetica",
		color: "#64748b",
		textAlign: "center",
		marginTop: 10,
	},
	courseName: {
		fontSize: 24,
		fontFamily: "Helvetica-Bold",
		color: "#1e3a8a",
		textAlign: "center",
		marginTop: 10,
	},
	distinction: {
		fontSize: 14,
		fontFamily: "Helvetica-Bold",
		color: "#ca8a04",
		textAlign: "center",
		marginTop: 15,
	},
	detailsText: {
		fontSize: 12,
		fontFamily: "Helvetica",
		color: "#64748b",
		textAlign: "center",
		marginTop: 5,
	},
	qrSection: {
		position: "absolute",
		bottom: 30,
		left: 30,
		flexDirection: "column",
		alignItems: "center",
	},
	qrImage: {
		width: 80,
		height: 80,
	},
	qrText: {
		fontSize: 8,
		color: "#1e3a8a",
		textAlign: "center",
		marginTop: 2,
		fontFamily: "Helvetica",
	},
	signatures: {
		position: "absolute",
		bottom: 40,
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		gap: 100,
	},
	signatureBlock: {
		flexDirection: "column",
		alignItems: "center",
		width: 150,
	},
	signatureLine: {
		borderBottomWidth: 1,
		borderBottomColor: "#000000",
		width: "100%",
		marginBottom: 5,
	},
	signatureRole: {
		fontSize: 10,
		fontFamily: "Helvetica",
		color: "#000000",
		textAlign: "center",
	},
	signatureDept: {
		fontSize: 8,
		fontFamily: "Helvetica",
		color: "#64748b",
		textAlign: "center",
	},
	watermarkContainer: {
		position: "absolute",
		bottom: 50,
		right: 50,
		opacity: 0.3,
		transform: "rotate(-45deg)",
	},
	watermarkText: {
		fontSize: 60,
		color: "#9ca3af",
		fontFamily: "Helvetica",
	},
});

export interface CertificateDocumentProps {
	studentName: string;
	courseName: string;
	issueDate: string;
	certificateId: string;
	verificationHash: string;
	qrCodeDataUrl?: string;
	distinction?: string;
	hours?: number;
}

const CertificateDocument: React.FC<CertificateDocumentProps> = ({
	studentName,
	courseName,
	issueDate,
	certificateId,
	qrCodeDataUrl,
	distinction,
	hours,
}) => {
	// Format date safely
	let formattedDate = issueDate;
	try {
		formattedDate = new Date(issueDate).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch (e) {
		// fallback if date parsing fails
	}

	let detailsText = `Completado el ${formattedDate}`;
	if (hours) {
		detailsText += ` • ${hours} horas de formación`;
	}

	const distinctionLabel =
		distinction === "excellence"
			? "EXCELENCIA ACADÉMICA"
			: distinction === "merit"
				? "MÉRITO DISTINGUIDO"
				: distinction && distinction !== "standard"
					? distinction.toUpperCase()
					: null;

	return (
		<Document>
			<Page size="A4" orientation="landscape" style={styles.page}>
				<View style={styles.borderContainer}>
					<View style={styles.innerBorder}>
						<View style={styles.header}>
							<Text style={styles.title}>CERTIFICADO DE LOGRO</Text>
							<Text style={styles.subtitle}>Este documento certifica que</Text>
						</View>

						<Text style={styles.studentName}>{studentName}</Text>
						<View style={styles.separator} />

						<Text style={styles.courseDetails}>
							Ha completado satisfactoriamente el curso
						</Text>
						<Text style={styles.courseName}>{courseName}</Text>

						{distinctionLabel && (
							<Text style={styles.distinction}>{distinctionLabel}</Text>
						)}
						<Text style={styles.detailsText}>{detailsText}</Text>

						{/* Signatures */}
						<View style={styles.signatures}>
							<View style={styles.signatureBlock}>
								<View style={styles.signatureLine} />
								<Text style={styles.signatureRole}>Director Académico</Text>
								<Text style={styles.signatureDept}>Getxo Bela Eskola</Text>
							</View>
							<View style={styles.signatureBlock}>
								<View style={styles.signatureLine} />
								<Text style={styles.signatureRole}>Instructor Jefe</Text>
								<Text style={styles.signatureDept}>Departamento de Vela</Text>
							</View>
						</View>

						{/* QR Code Section */}
						{qrCodeDataUrl && (
							<View style={styles.qrSection}>
								<Image src={qrCodeDataUrl} style={styles.qrImage} />
								<Text style={styles.qrText}>ID: {certificateId}</Text>
								<Text style={styles.qrText}>ESCANEA PARA VERIFICAR</Text>
							</View>
						)}

						{/* Watermark */}
						<View style={styles.watermarkContainer}>
							<Text style={styles.watermarkText}>GBE</Text>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default CertificateDocument;
