
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, pdf, Svg, Polygon } from '@react-pdf/renderer';
import * as QRCode from 'qrcode';

// Register Roboto font for Unicode support (tildes, ñ)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc4.woff2', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOkCnqEu92Fr1Mu51xIIzI.woff2', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOjCnqEu92Fr1MmHO2fBBc4.woff2', fontWeight: 'bold', fontStyle: 'italic' }
  ]
});

interface CertificateData {
    studentName: string;
    courseName: string;
    issueDate: string; // ISO string or formatted date
    certificateId: string; // The printable ID (e.g. CERT-2024-XXX)
    verificationHash: string; // The UUID or hash for URL
    distinction?: 'standard' | 'merit' | 'excellence';
    hours?: number;
    skills?: string[];
}

// 1mm ~= 2.835pt
const mmToPt = (mm: number) => mm * 2.835;

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fffbeb', // Cream
        padding: 0,
    },
    borderOuter: {
        position: 'absolute',
        top: mmToPt(10),
        left: mmToPt(10),
        right: mmToPt(10),
        bottom: mmToPt(10),
        borderWidth: 1,
        borderColor: '#ca8a04', // Accent
    },
    borderInner: {
        position: 'absolute',
        top: mmToPt(12),
        left: mmToPt(12),
        right: mmToPt(12),
        bottom: mmToPt(12),
        borderWidth: 0.5,
        borderColor: '#ca8a04', // Accent
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: mmToPt(15), // Slightly offset to center visually around header
    },
    title: {
        fontSize: 40,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#1e3a8a', // Primary
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#64748b', // Secondary
        marginBottom: 20,
    },
    studentName: {
        fontSize: 36,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#000000',
        marginBottom: 5,
        textAlign: 'center',
    },
    separator: {
        width: 150,
        height: 0.5,
        backgroundColor: '#ca8a04',
        marginBottom: 15,
    },
    courseText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#64748b',
        marginBottom: 10,
    },
    courseName: {
        fontSize: 24,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 15,
        textAlign: 'center',
    },
    distinction: {
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#ca8a04',
        marginBottom: 5,
    },
    details: {
        fontSize: 12,
        fontFamily: 'Roboto',
        color: '#64748b',
        marginBottom: 20,
    },
    signatureContainer: {
        position: 'absolute',
        bottom: mmToPt(40),
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: mmToPt(40),
    },
    signatureBlock: {
        alignItems: 'center',
        width: 200,
    },
    signatureLine: {
        width: 150,
        height: 1,
        backgroundColor: '#000000',
        marginBottom: 5,
    },
    signatureTitle: {
        fontSize: 10,
        fontFamily: 'Roboto',
        color: '#000000',
        fontWeight: 'bold',
    },
    signatureSubtitle: {
        fontSize: 8,
        fontFamily: 'Roboto',
        color: '#64748b',
    },
    watermark: {
        position: 'absolute',
        bottom: mmToPt(20),
        right: mmToPt(20),
        fontSize: 60,
        fontFamily: 'Roboto',
        color: '#c8c8c8', // lighter gray
        opacity: 0.5,
        transform: 'rotate(-45deg)',
    },
    qrContainer: {
        position: 'absolute',
        bottom: mmToPt(20), // Adjusted to fit
        left: mmToPt(20),
        alignItems: 'center',
    },
});

const CertificateDocument = ({ data, qrDataUrl }: { data: CertificateData, qrDataUrl: string }) => {
    // Determine distinction text
    let distinctionLabel = '';
    if (data.distinction && data.distinction !== 'standard') {
        distinctionLabel = data.distinction === 'excellence' ? 'EXCELENCIA ACADÉMICA' : 'MÉRITO DISTINGUIDO';
    }

    // Format date
    const dateStr = new Date(data.issueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    let detailsText = `Completado el ${dateStr}`;
    if (data.hours) {
        detailsText += ` • ${data.hours} horas de formación`;
    }

    // Triangle size in points
    const cornerSize = mmToPt(15);
    const cornerStr = `${cornerSize}`;

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Borders */}
                <View style={styles.borderOuter} />
                <View style={styles.borderInner} />

                {/* Corners - Masking (Cream colored triangles) */}
                {/* Top-Left */}
                <Svg style={{ position: 'absolute', top: mmToPt(10), left: mmToPt(10), width: cornerSize, height: cornerSize }}>
                     <Polygon points={`0,0 ${cornerStr},0 0,${cornerStr}`} fill="#fffbeb" />
                </Svg>
                {/* Top-Right */}
                <Svg style={{ position: 'absolute', top: mmToPt(10), right: mmToPt(10), width: cornerSize, height: cornerSize }}>
                     <Polygon points={`${cornerStr},0 0,0 ${cornerStr},${cornerStr}`} fill="#fffbeb" />
                </Svg>
                 {/* Bottom-Left */}
                <Svg style={{ position: 'absolute', bottom: mmToPt(10), left: mmToPt(10), width: cornerSize, height: cornerSize }}>
                     <Polygon points={`0,${cornerStr} 0,0 ${cornerStr},${cornerStr}`} fill="#fffbeb" />
                </Svg>
                 {/* Bottom-Right */}
                <Svg style={{ position: 'absolute', bottom: mmToPt(10), right: mmToPt(10), width: cornerSize, height: cornerSize }}>
                     <Polygon points={`${cornerStr},${cornerStr} ${cornerStr},0 0,${cornerStr}`} fill="#fffbeb" />
                </Svg>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>CERTIFICADO DE LOGRO</Text>
                    <Text style={styles.subtitle}>Este documento certifica que</Text>

                    <Text style={styles.studentName}>{data.studentName}</Text>
                    <View style={styles.separator} />

                    <Text style={styles.courseText}>Ha completado satisfactoriamente el curso</Text>
                    <Text style={styles.courseName}>{data.courseName}</Text>

                    {distinctionLabel ? (
                        <Text style={styles.distinction}>{distinctionLabel}</Text>
                    ) : null}

                    <Text style={styles.details}>{detailsText}</Text>
                </View>

                {/* Signatures */}
                <View style={styles.signatureContainer}>
                     {/* Director Academico */}
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>Director Académico</Text>
                        <Text style={styles.signatureSubtitle}>Getxo Bela Eskola</Text>
                    </View>
                     {/* Instructor Jefe */}
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>Instructor Jefe</Text>
                        <Text style={styles.signatureSubtitle}>Departamento de Vela</Text>
                    </View>
                </View>

                {/* QR Code */}
                {qrDataUrl && (
                     <View style={styles.qrContainer}>
                        <Image src={qrDataUrl} style={{ width: mmToPt(30), height: mmToPt(30) }} />
                        <Text style={{ fontSize: 8, fontFamily: 'Roboto', color: '#1e3a8a', marginTop: 5, textAlign: 'center' }}>ID: {data.certificateId}</Text>
                        <Text style={{ fontSize: 8, fontFamily: 'Roboto', color: '#1e3a8a', textAlign: 'center' }}>ESCANEA PARA VERIFICAR</Text>
                    </View>
                )}

                {/* Watermark */}
                <Text style={styles.watermark}>
                    GBE
                </Text>

            </Page>
        </Document>
    );
};

/**
 * Genera un PDF de certificado profesional A4 Horizontal
 */
export const generateCertificatePDF = async (data: CertificateData): Promise<void> => {
    // Generate QR URL
    const verificationUrl = `${window.location.origin}/es/verify/${data.verificationHash}`;
    let qrDataUrl = '';
    try {
        qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 300 });
    } catch (err) {
        console.error('Error creating QR', err);
    }

    const blob = await pdf(<CertificateDocument data={data} qrDataUrl={qrDataUrl} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificado_${data.certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
