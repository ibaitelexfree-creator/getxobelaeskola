import CertificateCard from "@/components/academy/CertificateCard";

interface PublicCertificatesGridProps {
	certificates: any[];
	studentName: string;
}

export default function PublicCertificatesGrid({
	certificates,
	studentName,
}: PublicCertificatesGridProps) {
	if (!certificates || certificates.length === 0) return null;

	return (
		<section className="mb-12">
			<h2 className="text-2xl font-display italic text-white mb-6 flex items-center gap-3">
				<span className="text-accent">▶</span> Certificados Oficiales
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{certificates.map((cert: any) => (
					<CertificateCard
						key={cert.id}
						certificate={cert}
						studentName={studentName}
						locale="es"
					/>
				))}
			</div>
		</section>
	);
}
