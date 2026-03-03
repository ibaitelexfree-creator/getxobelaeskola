import dynamic from 'next/dynamic';

const Chatbot = dynamic(() => import('@/components/academy/Chatbot'), {

});

export default function AcademyLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    return (
        <div className="min-h-screen bg-nautical-black relative">
            {children}
            <Chatbot />
        </div>
    );
}
