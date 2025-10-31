import React, { useState, useEffect } from 'react';
import { QuizAnswers, TasteProfile } from '../types';

// O backend agora é o responsável por falar com a IA.
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

type Step = 'quiz' | 'loading' | 'result';

const quizQuestions = [
    { id: 'vibe', question: 'Qual a sua vibe de bolo?', options: ['Clássico da Vovó', 'Leve & Fitness', 'Surpreendente & Gourmet', 'Sem restrições, amo todos!'] },
    { id: 'moment', question: 'Seu momento perfeito para um bolo é...', options: ['Café da manhã reforçado', 'Lanche da tarde aconchegante', 'Sobremesa especial', 'A qualquer hora!'] },
    { id: 'fruits', question: 'Frutas no bolo?', options: ['Sim, amo o frescor!', 'Com moderação, por favor', 'Prefiro os clássicos sem frutas'] },
];

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-64 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
        <p className="mt-4 text-lg text-[#8D6E63]">Analisando seu paladar...</p>
        <p className="text-sm text-gray-500">Estamos preparando uma sugestão deliciosa!</p>
    </div>
);


const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('quiz');
    const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
    const [profile, setProfile] = useState<TasteProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset state when modal is reopened
        if (isOpen) {
            setStep('quiz');
            setAnswers({});
            setProfile(null);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAnswer = (questionId: keyof QuizAnswers, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        setError(null); // Clear error when user interacts
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== quizQuestions.length) return;
        setStep('loading');
        setError(null);
        try {
            const response = await fetch(`${API_URL}/taste-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao gerar perfil.');
            }
            
            const result = await response.json();
            setProfile(result);
            setStep('result');
        } catch (err: any) {
            console.error("Failed to generate taste profile", err);
            setError(err.message || "Oops! Tivemos um probleminha na cozinha ao gerar seu perfil de sabor. Por favor, tente novamente.");
            setStep('quiz'); 
        }
    };
    
    const isQuizComplete = Object.keys(answers).length === quizQuestions.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {step === 'quiz' && (
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#8D6E63]">Descubra seu perfil de sabor!</h2>
                        <p className="text-center text-gray-600 mb-8">Responda 3 perguntinhas para a gente te conhecer melhor.</p>
                        
                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                                <p className="font-bold">Ocorreu um erro</p>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {quizQuestions.map(({ id, question, options }) => (
                                <div key={id}>
                                    <h3 className="font-semibold mb-3 text-lg text-[#5D4037]">{question}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {options.map(option => (
                                            <button 
                                                key={option}
                                                onClick={() => handleAnswer(id as keyof QuizAnswers, option)}
                                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${answers[id as keyof QuizAnswers] === option ? 'bg-[#E5B8B8] border-[#D99A9A] text-white shadow-md' : 'bg-white border-gray-200 hover:border-[#D99A9A] hover:bg-pink-50'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={handleSubmit}
                            disabled={!isQuizComplete}
                            className="w-full mt-8 py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Ver meu perfil
                        </button>
                    </div>
                )}
                
                {step === 'loading' && <LoadingSpinner />}

                {step === 'result' && profile && (
                    <div className="text-center">
                         <h2 className="text-3xl font-bold mb-4 text-[#8D6E63]">Seu Perfil de Sabor é...</h2>
                         <div className="bg-white p-6 rounded-lg border border-pink-100 shadow-inner">
                            <p className="text-lg mb-4 text-gray-700">{profile.profileDescription}</p>
                            <hr className="my-4 border-pink-100"/>
                            <p className="text-base text-gray-600 mb-1">Sugestão da casa para você:</p>
                            <p className="text-xl font-bold text-[#D99A9A]">{profile.cakeSuggestion}</p>
                         </div>
                         <button onClick={onClose} className="w-full mt-8 py-3 px-6 rounded-lg font-semibold text-white bg-[#E5B8B8] hover:bg-[#D99A9A] transition-colors">
                            Começar minha assinatura
                         </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OnboardingModal;