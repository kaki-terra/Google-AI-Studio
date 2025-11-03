import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface Subscription {
  id: number;
  customer_name: string;
  plan_title: string;
  plan_price: number;
  flavor_preference: string;
  delivery_day: string;
  delivery_time: string;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Para um projeto real, use um sistema de autenticação seguro!
    const CORRECT_PASSWORD = 'bolo';
    const password = prompt("Digite a senha de administrador para acessar esta página:");

    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta. Redirecionando para a página inicial.");
      window.location.href = '/';
    }
  }, []); // Executa apenas uma vez, na montagem do componente.

  useEffect(() => {
    if (!isAuthenticated) return; // Não busca os dados se não estiver autenticado

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/subscriptions`);
        if (!response.ok) {
          throw new Error("Falha ao buscar as assinaturas. A 'cozinha' (backend) pode estar 'acordando'. Tente recarregar em um minuto.");
        }
        const data = await response.json();
        setSubscriptions(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [isAuthenticated]); // Executa quando a autenticação for bem-sucedida

  if (!isAuthenticated) {
    // Mostra uma tela em branco ou de carregamento enquanto autentica
    return (
        <div className="bg-[#FFF9F2] min-h-screen flex justify-center items-center">
            <p className="text-[#8D6E63]">Verificando acesso...</p>
        </div>
    );
  }

  return (
    <div className="bg-[#FFF9F2] min-h-screen text-[#5D4037] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-brand text-[#D99A9A]">BoloFlix</h1>
            <h2 className="text-2xl font-bold text-[#8D6E63]">Painel de Assinaturas</h2>
          </div>
          <a href="/" className="bg-[#E5B8B8] text-white px-4 py-2 rounded-full hover:bg-[#D99A9A] transition-colors shadow-sm">
            Voltar para o site
          </a>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#D99A9A] mx-auto"></div>
              <p className="mt-4 text-lg text-[#8D6E63]">Acordando a agenda de pedidos...</p>
              <p className="text-sm text-gray-500">Isso pode levar até um minuto na primeira vez. Obrigado pela paciência!</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Ocorreu um erro</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && subscriptions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">Nenhuma assinatura registrada ainda.</p>
              <p className="text-md text-gray-400 mt-2">Os novos pedidos aparecerão aqui!</p>
            </div>
          )}

          {!loading && !error && subscriptions.length > 0 && (
            <table className="min-w-full divide-y divide-pink-100">
              <thead className="bg-[#FFF9F2]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8D6E63] uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8D6E63] uppercase tracking-wider">
                    Plano
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8D6E63] uppercase tracking-wider">
                    Preferência
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8D6E63] uppercase tracking-wider">
                    Entrega
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8D6E63] uppercase tracking-wider">
                    Data do Pedido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.customer_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sub.plan_title}</div>
                      <div className="text-sm text-gray-500">R$ {sub.plan_price},00</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.flavor_preference || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.delivery_day}, {sub.delivery_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sub.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <footer className="text-center mt-8 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Painel de Controle BoloFlix.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminPage;