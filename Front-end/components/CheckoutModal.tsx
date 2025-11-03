
import React, { useState, useEffect } from 'react';
import { Plan, User } from '../types';
import { useAuth } from '../contexts/AuthContext';


const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

type CheckoutStep = 'form' | 'loading' | 'success' | 'error';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const { user } = useAuth(); // Pega o usuário logado
  const [step, setStep] = useState<CheckoutStep>('form');
  const [formData, setFormData] = useState({
    customer_name: user?.email?.split('@')[0] || '',
    flavor_preference: '',
    delivery_day: 'Quarta-feira',
    delivery_time: 'Manhã (9h-12h)',
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({
        customer_name: user?.email?.split('@')[0] || '',
        flavor_preference: '',
        delivery_day: 'Quarta-feira',
        delivery_time: 'Manhã (9h-12h)',
      });
      setErrorMessage('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;
  
  if (!user) {
    // Medida de segurança, embora o fluxo principal já deva prevenir isso.
     return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-lg text-center p-8">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Erro de Autenticação</h2>
                <p>Você precisa estar logado para fazer uma assinatura.</p>
                 <button onClick={onClose} className="mt-6 bg-[#E5B8B8] text-white px-6 py-2 rounded-full">Fechar</button>
            </div>
        </div>
     );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setErrorMessage('');
    try {
      const payload = {
        userId: user.id,
        customerName: formData.customer_name,
        customerEmail: user.email,
        planTitle: plan.title,
        planPrice: parseInt(plan.price, 10),
        flavorPreference: formData.flavor_preference,
        deliveryDay: formData.delivery_day,
        deliveryTime: formData.delivery_time,
      };

      const response = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao processar a assinatura.');
      }
      
      setStep('success');

    } catch (err: any) {
      console.error("Failed to create subscription", err);
      setErrorMessage(err.message || "Erro interno ao salvar assinatura.");
      setStep('error');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'loading':
        return (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
            <p className="mt-4 text-lg text-[#8D6E63]">Processando sua assinatura...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#8D6E63]">Tudo Certo! 🎉</h2>
            <p className="text-lg mb-4 text-gray-700">Sua assinatura do plano <span className="font-bold text-[#D99A9A]">{plan.title}</span> foi confirmada.</p>
            <p className="text-gray-600">Enviamos um email de confirmação com todos os detalhes. Prepare-se para receber um pedacinho de felicidade em sua casa!</p>
            <button onClick={onClose} className="w-full mt-8 py-3 px-6 rounded-lg font-semibold text-white bg-[#E5B8B8] hover:bg-[#D99A9A] transition-colors">
              Fechar
            </button>
          </div>
        );
      case 'error':
         return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-500">Ops! Algo deu errado.</h2>
            <p className="text-lg mb-4 text-gray-700">{errorMessage}</p>
            <button onClick={() => setStep('form')} className="w-full mt-8 py-3 px-6 rounded-lg font-semibold text-white bg-[#E5B8B8] hover:bg-[#D99A9A] transition-colors">
              Tentar Novamente
            </button>
          </div>
        );
      case 'form':
      default:
        return (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#8D6E63]">Quase lá!</h2>
            <p className="text-center text-gray-600 mb-6">Você está assinando o plano <span className="font-bold text-[#D99A9A]">{plan.title}</span> por <span className="font-bold">R${plan.price}/mês</span>.</p>
            <p className="text-center text-gray-500 text-sm mb-8">Complete seus dados para finalizarmos seu pedido de felicidade.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-[#5D4037]">Seu nome (como gostaria de ser chamado)</label>
                <input type="text" name="customer_name" id="customer_name" value={formData.customer_name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" />
              </div>
              <div>
                <label htmlFor="flavor_preference" className="block text-sm font-medium text-[#5D4037]">Alguma preferência de sabor ou restrição? <span className="text-xs text-gray-400">(Opcional)</span></label>
                <input type="text" name="flavor_preference" id="flavor_preference" value={formData.flavor_preference} onChange={handleChange} placeholder="Ex: Amo chocolate, sem nozes por favor" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="delivery_day" className="block text-sm font-medium text-[#5D4037]">Melhor dia para entrega</label>
                  <select name="delivery_day" id="delivery_day" value={formData.delivery_day} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]">
                    <option>Quarta-feira</option>
                    <option>Sexta-feira</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="delivery_time" className="block text-sm font-medium text-[#5D4037]">Período</label>
                  <select name="delivery_time" id="delivery_time" value={formData.delivery_time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]">
                    <option>Manhã (9h-12h)</option>
                    <option>Tarde (14h-17h)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={!formData.customer_name} className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  Confirmar Assinatura
                </button>
              </div>
            </form>
          </>
        );
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default CheckoutModal;