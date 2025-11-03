import React, { useState } from 'react';
import { Plan } from '../types';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onOpenLogin: () => void;
}

type Step = 'details' | 'loading' | 'success' | 'error';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan, onOpenLogin }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('details');
    const [deliveryDay, setDeliveryDay] = useState('Quarta-feira');
    const [deliveryTime, setDeliveryTime] = useState('Manhã (9h-12h)');
    const [customerName, setCustomerName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            onOpenLogin();
            onClose();
            return;
        }

        if (!customerName.trim()) {
            setErrorMessage("Por favor, insira seu nome completo.");
            return;
        }

        setStep('loading');
        setErrorMessage('');

        try {
            const subscriptionData = {
                customer_name: customerName,
                customer_email: user.email,
                plan_title: plan.title,
                plan_price: Number(plan.price),
                delivery_day: deliveryDay,
                delivery_time: deliveryTime,
            };

            const response = await fetch(`${API_URL}/subscriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscriptionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao processar a assinatura.');
            }

            setStep('success');

        } catch (err: any) {
            setErrorMessage(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
            setStep('error');
        }
    };
    
    // Reset state when modal is closed/reopened
    React.useEffect(() => {
        if (isOpen) {
            setStep('details');
            setErrorMessage('');
            setCustomerName(user?.user_metadata?.full_name || '');
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {step === 'details' && (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#8D6E63]">Finalizar Assinatura</h2>
                        <div className="text-center bg-pink-50 border border-pink-200 p-4 rounded-lg mb-6">
                            <p className="font-semibold text-lg text-[#5D4037]">{plan.title}</p>
                            <p className="text-2xl font-bold text-[#D99A9A]">R${plan.price},00 <span className="text-base font-normal text-gray-500">/mês</span></p>
                        </div>
                        
                        {!user && (
                            <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded-lg mb-6">
                                <p className="text-yellow-800">Você precisa estar logado para assinar.</p>
                                <button type="button" onClick={() => { onOpenLogin(); onClose(); }} className="mt-2 font-bold text-[#D99A9A] hover:underline">
                                    Fazer Login ou Cadastrar-se
                                </button>
                            </div>
                        )}
                        
                        {user && (
                             <>
                                <p className="text-center text-sm text-gray-600 mb-6">Logado como: <span className="font-semibold">{user.email}</span></p>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="customer_name" className="block text-sm font-medium text-[#5D4037]">Seu nome completo</label>
                                        <input type="text" name="customer_name" id="customer_name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="delivery_day" className="block text-sm font-medium text-[#5D4037]">Dia da Entrega</label>
                                            <select name="delivery_day" id="delivery_day" value={deliveryDay} onChange={(e) => setDeliveryDay(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]">
                                                <option>Quarta-feira</option>
                                                <option>Sexta-feira</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="delivery_time" className="block text-sm font-medium text-[#5D4037]">Horário</label>
                                            <select name="delivery_time" id="delivery_time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]">
                                                <option>Manhã (9h-12h)</option>
                                                <option>Tarde (14h-17h)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {errorMessage && <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>}
                                <button type="submit" className="w-full mt-8 py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] transition-colors">
                                    Confirmar Assinatura
                                </button>
                             </>
                        )}
                    </form>
                )}
                
                {step === 'loading' && (
                     <div className="flex flex-col justify-center items-center h-64 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
                        <p className="mt-4 text-lg text-[#8D6E63]">Processando sua assinatura...</p>
                    </div>
                )}
                
                {step === 'success' && (
                    <div className="text-center py-10">
                        <h2 className="text-3xl font-bold mb-4 text-[#8D6E63]">Tudo certo!</h2>
                        <p className="text-lg text-gray-700 mb-6">Sua assinatura do plano <span className="font-bold">{plan.title}</span> foi confirmada com sucesso. Prepare-se para receber muito carinho em forma de bolo!</p>
                        <button onClick={onClose} className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-[#E5B8B8] hover:bg-[#D99A9A] transition-colors">
                            Fechar
                        </button>
                    </div>
                )}

                {(step === 'error') && (
                     <div className="text-center py-10">
                        <h2 className="text-3xl font-bold mb-4 text-red-600">Ops! Algo deu errado.</h2>
                        <p className="text-lg text-gray-700 mb-6">{errorMessage}</p>
                        <button onClick={() => setStep('details')} className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-[#E5B8B8] hover:bg-[#D99A9A] transition-colors">
                            Tentar Novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
