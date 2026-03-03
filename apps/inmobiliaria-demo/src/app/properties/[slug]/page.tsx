import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROPERTIES, getPropertyBySlug } from '../../../data/properties';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import PropertyDetailClient from '../../../components/properties/PropertyDetailClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return PROPERTIES.map((p) => ({
        slug: p.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const property = getPropertyBySlug(slug);
    if (!property) return { title: 'Not Found | Luxe Dubai Estates' };

    return {
        title: property.metaTitle,
        description: property.metaDescription,
        openGraph: {
            title: property.metaTitle,
            description: property.metaDescription,
            images: [property.mainImage]
        }
    };
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const property = getPropertyBySlug(slug);
    if (!property) return notFound();

    const formattedPrice = new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        maximumFractionDigits: 0
    }).format(property.price);

    const similarProperties = PROPERTIES
        .filter(p => p.neighborhood === property.neighborhood && p.id !== property.id)
        .slice(0, 3);

    return (
        <>
            <Header />
            <PropertyDetailClient
                property={property}
                similarProperties={similarProperties}
                formattedPrice={formattedPrice}
            />
            <Footer />
        </>
    );
}
