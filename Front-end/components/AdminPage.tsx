import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditSubscriptionModal from './EditSubscriptionModal';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// This interface is also used by EditSubscriptionModal
export interface Subscription {
  id: number;
  created_at: string;
  customer_name: string;
  plan_title: string;
  plan_price: number;
  flavor_preference: string;
  delivery_day: string;
  delivery_time: string;
}

const AdminPage: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/'); // Redirect to home if not authenticated
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${API_URL}/subscriptions`);
          if (!response.ok) {
            throw new Error('Falha ao buscar as assinaturas.');
          }
          const data = await response.json();
          setSubscriptions(data || []); // Assuming the endpoint returns an array
        } catch (err: any) {
          setError(err.message || 'Ocorreu um erro desconhecido.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
        fetchSubscriptions();
    }
  }, [user, authLoading]);

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  const handleCloseModal = () => {
    setEditingSubscription(null);
  };

  const handleSave = (updatedSubscription: Subscription) => {
    setSubscriptions(prev =>
      prev.map(sub => (sub.id === updatedSubscription.id ? updatedSubscription : sub))
    );
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta assinatura?')) {
      try {
        const response = await fetch(`${API_URL}/subscriptions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Falha ao excluir a assinatura.');
        }
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao excluir.');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FFF9F2]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
      </div>
    );
  }

  const getUsername = () => {
    if(!user) return '';
    return user.email?.split('@')[0] || 'Admin';
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#5D4037]">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-[#8D6E63]">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">BoloFlix</p>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm">Olá, <span className="font-semibold capitalize">{getUsername()}</span>!</span>
                <button
                    onClick={signOut}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm"
                >
                    Sair
                </button>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-6">Gerenciar Assinaturas</h2>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
          </div>
        )}

        {error && !loading && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-[#8D6E63] uppercase bg-[#FFF9F2]">
                <tr>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Plano</th>
                  <th scope="col" className="px-6 py-3">Entrega</th>
                  <th scope="col" className="px-6 py-3">Preferências</th>
                  <th scope="col" className="px-6 py-3">Data do Pedido</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length > 0 ? (
                  subscriptions.map(sub => (
                    <tr key={sub.id} className="bg-white border-b hover:bg-pink-50">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{sub.customer_name}</th>
                      <td className="px-6 py-4">{sub.plan_title} (R${sub.plan_price})</td>
                      <td className="px-6 py-4">{sub.delivery_day}, {sub.delivery_time}</td>
                      <td className="px-6 py-4">{sub.flavor_preference || '-'}</td>
                      <td className="px-6 py-4">{new Date(sub.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEdit(sub)} className="font-medium text-[#D99A9A] hover:underline">Editar</button>
                        <button onClick={() => handleDelete(sub.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8">Nenhuma assinatura encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editingSubscription && (
        <EditSubscriptionModal
          isOpen={!!editingSubscription}
          onClose={handleCloseModal}
          subscription={editingSubscription}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminPage;
