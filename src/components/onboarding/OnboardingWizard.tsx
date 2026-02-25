'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Level = 'Iniciación' | 'Intermedio' | 'Avanzado';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
  });
  const [loading, setLoading] = useState(false);
  const [resultLevel, setResultLevel] = useState<Level | null>(null);

  const handleAnswer = (question: 'q1' | 'q2' | 'q3', value: number) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
    if (step < 4) {
      setStep(step + 1);
    } else {
      calculateLevel({ ...answers, [question]: value });
      setStep(5);
    }
  };

  const calculateLevel = (finalAnswers: typeof answers) => {
    const score = finalAnswers.q1 + finalAnswers.q2 + finalAnswers.q3;
    let level: Level = 'Iniciación';
    if (score >= 6) {
      level = 'Avanzado';
    } else if (score >= 3) {
      level = 'Intermedio';
    }
    setResultLevel(level);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Award 50 XP for completing onboarding
      const response = await fetch('/api/perfiles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xp: 50, // Reward
          nivel_inicial: resultLevel,
          onboarding_completed: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Redirect or show success
      // For now, reload or redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      alert('Hubo un error al guardar tu perfil. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10 border border-gray-100">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      {step === 1 && (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">¡Bienvenido a Getxo Bela Eskola!</h2>
          <p className="text-gray-600 text-lg">
            Estamos encantados de tenerte aquí. Antes de comenzar, nos gustaría conocer un poco más sobre tu experiencia en navegación para personalizar tu aprendizaje.
          </p>
          <button
            onClick={() => setStep(2)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-md"
          >
            Comenzar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">1. ¿Cuál es tu experiencia navegando?</h3>
          <div className="space-y-3">
            {[
              { label: 'Ninguna, soy principiante', value: 0 },
              { label: 'He navegado algunas veces', value: 1 },
              { label: 'Navego regularmente', value: 2 },
              { label: 'Soy un experto', value: 3 },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => handleAnswer('q1', option.value)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group"
              >
                <span className="text-gray-700 group-hover:text-blue-700 font-medium">{option.label}</span>
                <span className="text-gray-300 group-hover:text-blue-500">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">2. ¿Qué conocimientos técnicos tienes?</h3>
          <div className="space-y-3">
            {[
              { label: 'No conozco la terminología', value: 0 },
              { label: 'Conozco conceptos básicos (babor, estribor)', value: 1 },
              { label: 'Sé realizar maniobras (virada, trasluchada)', value: 2 },
              { label: 'Entiendo de trimado y meteorología avanzada', value: 3 },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => handleAnswer('q2', option.value)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group"
              >
                <span className="text-gray-700 group-hover:text-blue-700 font-medium">{option.label}</span>
                <span className="text-gray-300 group-hover:text-blue-500">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">3. ¿Tienes alguna titulación náutica?</h3>
          <div className="space-y-3">
            {[
              { label: 'Ninguna', value: 0 },
              { label: 'Licencia de Navegación (Titulín)', value: 1 },
              { label: 'PER (Patrón de Embarcaciones de Recreo)', value: 2 },
              { label: 'Patrón de Yate o superior', value: 3 },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => handleAnswer('q3', option.value)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group"
              >
                <span className="text-gray-700 group-hover:text-blue-700 font-medium">{option.label}</span>
                <span className="text-gray-300 group-hover:text-blue-500">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="text-center space-y-8">
          <div className="bg-blue-50 p-8 rounded-full inline-block mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">¡Evaluación Completada!</h2>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 mb-2 uppercase tracking-wide text-sm font-semibold">Tu nivel estimado</p>
            <p className="text-4xl font-bold text-blue-600">{resultLevel}</p>
          </div>
          <p className="text-gray-600">
            Hemos actualizado tu perfil con esta información. ¡Estás listo para zarpar!
          </p>
          <button
            onClick={handleFinish}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Finalizar y Guardar Perfil'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
