import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  // Reset form when modal is opened or view changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmail('');
      setPassword('');
    }
  }, [isOpen, view]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const action = view === 'login' ? signIn : signUp;
    const { error: authError } = await action(email, password);

    if (authError) {
      setError(authError.message);
    } else {
      if (view === 'signup') {
        alert('Cadastro realizado! Por favor, verifique seu email para confirmar a conta.');
      }
      onClose();
    }
    setLoading(false);
  };

  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FFF9F2] rounded-2xl shadow-2xl w-full max-w-md p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#8D6E63]">
          {view === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua conta'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-auth" className="sr-only">Email</label>
            <input 
              id="email-auth"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D99A9A]"
            />
          </div>
          <div>
            <label htmlFor="password-auth" className="sr-only">Senha</label>
            <input 
              id="password-auth"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D99A9A]"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] disabled:bg-gray-300 transition-colors"
          >
            {loading ? 'Aguarde...' : view === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {view === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          <button onClick={toggleView} className="font-semibold text-[#D99A9A] hover:underline ml-1">
            {view === 'login' ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;
