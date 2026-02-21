import WindSensor from '@/components/tools/WindSensor';

export default function ToolsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Herramientas</h1>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <p className="text-center text-gray-600 mb-6">
                        Monitoriza el viento en tiempo real desde nuestra estación IoT.
                    </p>
                    <WindSensor />
                </div>
            </div>
        </div>
    );
}
