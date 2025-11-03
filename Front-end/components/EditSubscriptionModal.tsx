import React, { useState, useEffect } from 'react';
import { Subscription } from './AdminPage';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onSave: (updatedSubscription: Subscription) => void;
}

const EditSubscriptionModal: React.FC<EditModalProps> = ({ isOpen, onClose, subscription, onSave }) => {
  const [formData, setFormData] = useState(subscription);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Atualiza o formulário se a prop de assinatura mudar
    setFormData(subscription);
  }, [subscription]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_name: formData.customer_name,
            flavor_preference: formData.flavor_preference,
            delivery_day: formData.delivery_day,
            delivery_time: formData.delivery_time,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar as alterações.');
      }
      
      const result = await response.json();
      onSave(result.data);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-4 text-[#8D6E63]">Editar Assinatura</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Plano: <span className="font-semibold">{subscription.plan_title}</span> | Pedido em: {new Date(subscription.created_at).toLocaleDateString('pt-BR')}</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-[#5D4037]">Nome do Cliente</label>
            <input type="text" name="customer_name" id="customer_name" value={formData.customer_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" />
          </div>
          <div>
            <label htmlFor="flavor_preference" className="block text-sm font-medium text-[#5D4037]">Preferência de Sabor</label>
            <input type="text" name="flavor_preference" id="flavor_preference" value={formData.flavor_preference} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="delivery_day" className="block text-sm font-medium text-[#5D4037]">Dia da Entrega</label>
              <select name="delivery_day" id="delivery_day" value={formData.delivery_day} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]">
                <option>Quarta-feira</option>
                <option>Sexta-feira</option>
              </select>
            </div>
            <div>
              <label htmlFor="delivery_time" className="block text-sm font-medium text-[#5D4037]">Horário</label>
              <select name="delivery_time" id="delivery_time" value={formData.delivery_time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]">
                <option>Manhã (9h-12h)</option>
                <option>Tarde (14h-17h)</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-[#D99A9A] border border-transparent rounded-md shadow-sm hover:bg-[#BF8B8B] disabled:bg-gray-300">
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionModal;