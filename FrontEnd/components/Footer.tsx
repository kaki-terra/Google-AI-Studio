
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5D4037] text-white">
      <div className="container mx-auto px-6 py-10 text-center">
        <h2 className="text-3xl font-brand text-[#E5B8B8] mb-4">BoloFlix</h2>
        <p className="max-w-lg mx-auto mb-6 text-amber-50">
          Feito com amor, entregue com carinho. Transformando momentos em doces memórias.
        </p>
        <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="hover:text-[#E5B8B8] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#E5B8B8] transition-colors">Facebook</a>
            <a href="#" className="hover:text-[#E5B8B8] transition-colors">WhatsApp</a>
        </div>
        <div className="border-t border-amber-800 pt-6 text-sm text-amber-200">
          <p>&copy; {new Date().getFullYear()} BoloFlix. Todos os direitos reservados.</p>
          <p>Um protótipo delicioso gerado por IA.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
