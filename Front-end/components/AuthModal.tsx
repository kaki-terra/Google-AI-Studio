import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: 'login' | 'sign_up';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    setView(initialView);
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
  }, [initialView, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (view === 'sign_up') {
        const { error: authError } = await signUp(email, password);
        setLoading(false);
        if (authError) {
            if (authError.message.includes('User already registered')) {
                setError('Este email já está cadastrado. Por favor, tente fazer login.');
            } else {
                setError(authError.message);
            }
        } else {
            setSuccessMessage('Cadastro realizado! Por favor, verifique seu email para confirmar sua conta.');
            setView('login'); // Muda para a tela de login para conveniência
        }
    } else { // Login
        const { error: authError } = await signIn(email, password);
        setLoading(false);
        if (authError) {
            setError('Email ou senha inválidos.');
        } else {
            onClose(); // Fecha o modal no sucesso do login
        }
    }
  };

  const toggleView = () => {
    setView(view === 'login' ? 'sign_up' : 'login');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-md p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#8D6E63]">
          {view === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua conta'}
        </h2>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm" role="alert">
                <p>{error}</p>
            </div>
        )}
        
        {successMessage && !error && (
             <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 text-sm" role="alert">
                <p>{successMessage}</p>
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-auth" className="block text-sm font-medium text-[#5D4037]">Email</label>
            <input 
              id="email-auth"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" 
            />
          </div>
          <div>
            <label htmlFor="password-auth" className="block text-sm font-medium text-[#5D4037]">Senha</label>
            <input 
              id="password-auth"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D99A9A] focus:border-[#D99A9A]" 
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processando...' : (view === 'login' ? 'Entrar' : 'Cadastrar')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                {view === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button onClick={toggleView} className="ml-1 font-semibold text-[#BF8B8B] hover:underline focus:outline-none">
                    {view === 'login' ? 'Cadastre-se' : 'Faça login'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;