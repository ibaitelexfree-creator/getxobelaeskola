import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font, Svg, Polygon } from '@react-pdf/renderer';

// Register fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.ttf', fontWeight: 400 }, // Regular
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc4.ttf', fontWeight: 700 }, // Bold
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOkCnqEu92Fr1Mu51xIIzI.ttf', fontWeight: 400, fontStyle: 'italic' }, // Italic
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOjCnqEu92Fr1Mu51TzBic6CsQ.ttf', fontWeight: 700, fontStyle: 'italic' } // Bold Italic
    ]
});

export interface CertificateData {
    studentName: string;
    courseName: string;
    issueDate: string;
    certificateId: string;
    verificationHash: string;
    distinction?: 'standard' | 'merit' | 'excellence';
    hours?: number;
    skills?: string[];
}

interface CertificateDocumentProps {
    data: CertificateData;
    qrCodeUrl?: string;
}

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#fffbeb', // amber-50
        fontFamily: 'Roboto',
        padding: 0,
    },
    borderOuter: {
        margin: 10,
        borderWidth: 1,
        borderColor: '#ca8a04', // yellow-600
        borderStyle: 'solid',
        flexGrow: 1,
        position: 'relative',
    },
    borderInner: {
        margin: 2, // relative to outer
        borderWidth: 0.5,
        borderColor: '#ca8a04',
        borderStyle: 'solid',
        flexGrow: 1,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 40,
        color: '#1e3a8a', // blue-900
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b', // slate-500
        textAlign: 'center',
        marginBottom: 20,
    },
    studentName: {
        fontSize: 36,
        fontFamily: 'Roboto',
        fontStyle: 'italic',
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 5,
    },
    separator: {
        width: 120,
        height: 1,
        backgroundColor: '#ca8a04',
        marginBottom: 20,
    },
    courseInfo: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 5,
    },
    courseName: {
        fontSize: 24,
        color: '#1e3a8a',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    details: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 5,
    },
    distinction: {
        fontSize: 12,
        color: '#ca8a04',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    qrContainer: {
        alignItems: 'center',
        width: 100,
    },
    qrImage: {
        width: 80,
        height: 80,
    },
    qrText: {
        fontSize: 8,
        color: '#1e3a8a',
        textAlign: 'center',
        marginTop: 2,
    },
    signatures: {
        flexDirection: 'row',
        gap: 40,
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    signatureBlock: {
        alignItems: 'center',
        width: 140,
    },
    signatureLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#000000',
        marginBottom: 5,
    },
    signatureTitle: {
        fontSize: 10,
        color: '#000000',
        textAlign: 'center',
    },
    signatureSubtitle: {
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center',
    },
    watermark: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        fontSize: 60,
        color: '#cccccc',
        opacity: 0.3,
        transform: 'rotate(-45deg)',
    }
});

const CertificateDocument: React.FC<CertificateDocumentProps> = ({ data, qrCodeUrl }) => {
    // Format Date
    const dateStr = new Date(data.issueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    let detailsText = `Completado el ${dateStr}`;
    if (data.hours) {
        detailsText += ` • ${data.hours} horas de formación`;
    }

    const distinctionLabel = data.distinction === 'excellence' ? 'EXCELENCIA ACADÉMICA' :
                            data.distinction === 'merit' ? 'MÉRITO DISTINGUIDO' : null;

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.borderOuter}>

                    {/* Corners */}
                    <Svg height="15" width="15" style={{ position: 'absolute', top: 0, left: 0 }}>
                        <Polygon points="0,0 15,0 0,15" fill="#ca8a04" />
                    </Svg>
                    <Svg height="15" width="15" style={{ position: 'absolute', top: 0, right: 0 }}>
                        <Polygon points="15,0 0,0 15,15" fill="#ca8a04" />
                    </Svg>
                    <Svg height="15" width="15" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                        <Polygon points="0,15 15,15 0,0" fill="#ca8a04" />
                    </Svg>
                    <Svg height="15" width="15" style={{ position: 'absolute', bottom: 0, right: 0 }}>
                        <Polygon points="15,15 0,15 15,0" fill="#ca8a04" />
                    </Svg>

                    <View style={styles.borderInner}>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>CERTIFICADO DE LOGRO</Text>
                            <Text style={styles.subtitle}>Este documento certifica que</Text>
                        </View>

                        {/* Student Name */}
                        <Text style={styles.studentName}>{data.studentName}</Text>
                        <View style={styles.separator} />

                        {/* Course Details */}
                        <Text style={styles.courseInfo}>Ha completado satisfactoriamente el curso</Text>
                        <Text style={styles.courseName}>{data.courseName}</Text>

                        {/* Additional Info */}
                        {distinctionLabel && (
                            <Text style={styles.distinction}>{distinctionLabel}</Text>
                        )}
                        <Text style={styles.details}>{detailsText}</Text>

                        {/* Footer Section */}
                        <View style={styles.footer}>
                            {/* QR Code */}
                            <View style={styles.qrContainer}>
                                {qrCodeUrl && <Image src={qrCodeUrl} style={styles.qrImage} />}
                                <Text style={styles.qrText}>ID: {data.certificateId}</Text>
                                <Text style={styles.qrText}>ESCANEA PARA VERIFICAR</Text>
                            </View>

                            {/* Signatures */}
                            <View style={styles.signatures}>
                                <View style={styles.signatureBlock}>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureTitle}>Director Académico</Text>
                                    <Text style={styles.signatureSubtitle}>Getxo Bela Eskola</Text>
                                </View>
                                <View style={styles.signatureBlock}>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureTitle}>Instructor Jefe</Text>
                                    <Text style={styles.signatureSubtitle}>Departamento de Vela</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Watermark */}
                    <Text style={styles.watermark}>GBE</Text>
                </View>
            </Page>
        </Document>
    );
};

export default CertificateDocument;
