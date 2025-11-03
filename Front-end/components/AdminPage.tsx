import React, { useState, useEffect, useCallback } from 'react';
import EditSubscriptionModal from './EditSubscriptionModal';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface Subscription {
  id: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  plan_title: string;
  plan_price: number;
  flavor_preference: string | null;
  delivery_day: string;
  delivery_time: string;
}

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('boloflix-admin-auth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);
    
    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setDataError(null);
        try {
            const response = await fetch(`${API_URL}/subscriptions`);
            if (!response.ok) throw new Error('Falha ao buscar assinaturas.');
            const data = await response.json();
            setSubscriptions(data);
        } catch (err: any) {
            setDataError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscriptions();
        }
    }, [isAuthenticated, fetchSubscriptions]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        try {
            const response = await fetch(`${API_URL}/admin/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!response.ok) throw new Error('Senha incorreta.');
            const data = await response.json();
            if (data.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem('boloflix-admin-auth', 'true');
            } else {
                throw new Error('Senha incorreta.');
            }
        } catch (err: any) {
            setAuthError(err.message);
        }
    };
    
    const handleLogout = () => {
        sessionStorage.removeItem('boloflix-admin-auth');
        setIsAuthenticated(false);
        setSubscriptions([]);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta assinatura?')) {
            setDataError(null);
            try {
                const response = await fetch(`${API_URL}/subscriptions/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir assinatura.');
                setSubscriptions(prev => prev.filter(sub => sub.id !== id));
            } catch (err: any) {
                setDataError(err.message);
            }
        }
    };
    
    const handleOpenEditModal = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setSelectedSubscription(null);
        setIsEditModalOpen(false);
    };

    const handleSaveSubscription = (updatedSubscription: Subscription) => {
        setSubscriptions(prev => 
            prev.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub)
        );
        handleCloseEditModal();
    };


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
                    <h1 className="text-2xl font-bold text-center text-[#8D6E63] mb-6">Acesso Restrito</h1>
                    <form onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="password-admin" className="sr-only">Senha do administrador</label>
                            <input
                                id="password-admin"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha do administrador"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D99A9A] focus:border-transparent"
                            />
                        </div>
                        {authError && <p className="text-red-500 text-sm mt-2 text-center">{authError}</p>}
                        <button type="submit" className="w-full mt-4 py-3 px-4 bg-[#E5B8B8] text-white font-semibold rounded-lg hover:bg-[#D99A9A] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D99A9A]">
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF9F2] p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold text-[#8D6E63]">Painel de Administrador</h1>
                    <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium">
                        Sair
                    </button>
                </div>
                
                {loading && <div className="text-center p-8">Carregando assinaturas...</div>}
                {dataError && <div className="text-center p-8 text-red-500 bg-red-100 rounded-lg">{dataError}</div>}
                
                {!loading && !dataError && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-[#8D6E63] uppercase bg-[#FFE4E4]">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Cliente</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Plano</th>
                                    <th scope="col" className="px-6 py-3">Valor</th>
                                    <th scope="col" className="px-6 py-3">Preferência</th>
                                    <th scope="col" className="px-6 py-3">Entrega</th>
                                    <th scope="col" className="px-6 py-3">Data do Pedido</th>
                                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.length > 0 ? subscriptions.map(sub => (
                                    <tr key={sub.id} className="bg-white border-b hover:bg-pink-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{sub.customer_name}</td>
                                        <td className="px-6 py-4">{sub.customer_email}</td>
                                        <td className="px-6 py-4">{sub.plan_title}</td>
                                        <td className="px-6 py-4">R$ {sub.plan_price?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4">{sub.flavor_preference || 'N/A'}</td>
                                        <td className="px-6 py-4">{sub.delivery_day}, {sub.delivery_time}</td>
                                        <td className="px-6 py-4">{new Date(sub.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenEditModal(sub)} className="font-medium text-blue-600 hover:underline mr-4">Editar</button>
                                            <button onClick={() => handleDelete(sub.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center p-8 text-gray-500">Nenhuma assinatura encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {isEditModalOpen && selectedSubscription && (
                <EditSubscriptionModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    subscription={selectedSubscription}
                    onSave={handleSaveSubscription}
                />
            )}
        </div>
    );
};

export default AdminPage;
