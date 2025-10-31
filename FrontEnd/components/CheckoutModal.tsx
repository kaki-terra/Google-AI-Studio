import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { generateWelcomeMessage, checkDeliveryAvailability } from '../services/geminiService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

type Step = 'preferences' | 'payment' | 'loading' | 'success';

// A URL do backend agora é definida por uma variável de ambiente.
// Esta é a correção final: usamos o nome que a Vercel está forçando.
const API_URL = process.env.URL_DE_ACKEND || 'http://localhost:3001';


const planPreferences: { [key: string]: string[] } = {
    'Bolo Curioso': ['Sabores Tradicionais (Cenoura, Fubá, Chocolate)'],
    'Bolo Apaixonado': ['Estilo Tradicional', 'Estilo Fit (Menos açúcar)', 'Estilo Vegano'],
    'Família BoloFlix': ['Opções Gourmet (Red Velvet, Pistache)', 'Clássicos da Família', 'Mix de Sabores da Semana'],
};
const deliveryDays = ['Quarta-feira', 'Sexta-feira'];
const deliveryTimes = ['Manhã (9h-12h)', 'Tarde (14h-17h)'];


const LoadingSpinner: React.FC<{text: string}> = ({ text }) => (
    <div className="flex flex-col justify-center items-center h-80 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
        <p className="mt-4 text-lg text-[#8D6E63]">{text}</p>
    </div>
);

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
    const [step, setStep] = useState<Step>('preferences');
    const [name, setName] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [error, setError] = useState('');
    
    // Preferences state
    const [selectedFlavor, setSelectedFlavor] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Availability state
    const [isChecking, setIsChecking] = useState(false);
    const [availabilityMsg, setAvailabilityMsg] = useState('');
    const [isAvailable, setIsAvailable] = useState(false);


    const resetState = () => {
        setStep('preferences');
        setName('');
        setWelcomeMessage('');
        setError('');
        setSelectedFlavor('');
        setSelectedDay('');
        setSelectedTime('');
        setIsChecking(false);
        setAvailabilityMsg('');
        setIsAvailable(false);
    };

    useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const handleCheckAvailability = async () => {
        if (!selectedDay || !selectedTime) return;
        setIsChecking(true);
        setAvailabilityMsg('');
        setIsAvailable(false);
        try {
            const { available, message } = await checkDeliveryAvailability(selectedDay, selectedTime.split(' ')[0].toLowerCase());
            setAvailabilityMsg(message);
            setIsAvailable(available);
        } catch (err: any) {
            setAvailabilityMsg('Erro ao verificar. Tente novamente.');
            setIsAvailable(false);
        } finally {
            setIsChecking(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Por favor, insira seu nome.');
            return;
        }
        setError('');
        setStep('loading');

        try {
            const subscriptionData = {
                customerName: name,
                planTitle: plan.title,
                planPrice: plan.price,
                flavorPreference: selectedFlavor,
                deliveryDay: selectedDay,
                deliveryTime: selectedTime,
            };
            
            const response = await fetch(`${API_URL}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscriptionData),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao registrar a assinatura.');
            }

            const message = await generateWelcomeMessage(plan.title, name, selectedDay);
            setWelcomeMessage(message);
            setStep('success');

        } catch (err: any) {
            console.error("Failed to submit subscription", err);
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                setError('Não foi possível conectar ao servidor. Verifique se a "cozinha" (o backend) está ligada e rodando no terminal. 😉');
            } else {
                setError(err.message || 'Ocorreu um erro ao finalizar. Tente novamente.');
            }
            setStep('payment');
        }
    };
    
    const preferencesComplete = selectedFlavor && selectedDay && selectedTime;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {step === 'preferences' && (
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-1 text-[#8D6E63]">Passo 1: Suas Preferências</h2>
                        <p className="text-center text-gray-500 mb-4">Personalize sua assinatura do plano <span className="font-bold">{plan.title}</span>.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-md text-[#5D4037]">Estilo do Bolo</h3>
                                {planPreferences[plan.title].map(flavor => (
                                     <button key={flavor} onClick={() => setSelectedFlavor(flavor)} className={`w-full p-3 text-sm rounded-lg border-2 text-left transition-all duration-200 ${selectedFlavor === flavor ? 'bg-[#E5B8B8] border-[#D99A9A] text-white' : 'bg-white'}`}>{flavor}</button>
                                ))}
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2 text-md text-[#5D4037]">Dia da Entrega</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {deliveryDays.map(day => <button key={day} onClick={() => { setSelectedDay(day); setIsAvailable(false); setAvailabilityMsg(''); }} className={`p-3 text-sm rounded-lg border-2 text-center transition-all duration-200 ${selectedDay === day ? 'bg-[#E5B8B8] border-[#D99A9A] text-white' : 'bg-white'}`}>{day}</button>)}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2 text-md text-[#5D4037]">Horário</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {deliveryTimes.map(time => <button key={time} onClick={() => { setSelectedTime(time); setIsAvailable(false); setAvailabilityMsg(''); }} className={`p-3 text-sm rounded-lg border-2 text-center transition-all duration-200 ${selectedTime === time ? 'bg-[#E5B8B8] border-[#D99A9A] text-white' : 'bg-white'}`}>{time}</button>)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button onClick={handleCheckAvailability} disabled={!selectedDay || !selectedTime || isChecking} className="text-sm text-[#D99A9A] hover:underline disabled:text-gray-400 disabled:no-underline">
                                {isChecking ? 'Verificando...' : 'Verificar disponibilidade de entrega'}
                            </button>
                             {availabilityMsg && <p className={`text-sm mt-2 p-2 rounded-md ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{availabilityMsg}</p>}
                        </div>

                        <button onClick={() => setStep('payment')} disabled={!preferencesComplete || !isAvailable} className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                           Ir para Pagamento
                        </button>
                    </div>
                )}

                {step === 'payment' && (
                     <div>
                        <h2 className="text-2xl font-bold text-center mb-2 text-[#8D6E63]">Passo 2: Pagamento</h2>
                         <div className="bg-white p-4 rounded-lg border border-pink-100 my-4 text-sm">
                            <p className="font-bold text-lg text-[#5D4037] border-b pb-2 mb-2">Resumo do Pedido</p>
                            <div className="flex justify-between"><span className="text-gray-600">Plano:</span> <span className="font-semibold">{plan.title}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Preferência:</span> <span className="font-semibold">{selectedFlavor}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Entrega:</span> <span className="font-semibold">{selectedDay}, {selectedTime}</span></div>
                            <div className="flex justify-between mt-2 pt-2 border-t"><span className="font-bold">Total:</span> <span className="font-bold text-xl text-[#D99A9A]">R${plan.price}/mês</span></div>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-[#5D4037]">Nome Completo</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" placeholder="Seu nome aqui" required />
                            </div>
                            <div>
                                <label htmlFor="card" className="block text-sm font-medium text-[#5D4037]">Dados do Cartão (Simulação)</label>
                                <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                                    <p className="text-gray-400">**** **** **** 1234</p>
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] transition-colors">
                                Assinar e pagar R${plan.price}
                            </button>
                            <button onClick={() => setStep('preferences')} type="button" className="w-full text-center text-sm text-gray-500 hover:underline mt-2">
                                Voltar e alterar preferências
                            </button>
                        </form>
                    </div>
                )}
                
                {step === 'loading' && <LoadingSpinner text="Registrando sua assinatura..." />}

                {step === 'success' && (
                     <div className="text-center flex flex-col items-center justify-center h-80">
                         <svg className="w-16 h-16 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         <h2 className="text-2xl font-bold mb-4 text-[#8D6E63]">Bem-vindo(a) à família BoloFlix!</h2>
                         <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-inner">
                            <p className="text-gray-700">{welcomeMessage || "Sua assinatura foi confirmada! Prepare-se para receber muito carinho em forma de bolo."}</p>
                         </div>
                         <button onClick={onClose} className="w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white bg-[#E5B8B8] hover:bg-[#D99A9A] transition-colors">
                            Fechar
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;