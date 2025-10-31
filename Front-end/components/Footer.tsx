import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5D4037] text-white">
      <div className="container mx-auto px-6 py-10 text-center">
        <div className="mb-4">
          <h2 className="text-3xl font-brand text-[#E5B8B8]">BoloFlix</h2>
          <p className="text-sm text-amber-100 -mt-1">By Quintal dos Kitutes</p>
        </div>
        <div className="max-w-lg mx-auto mb-6 text-amber-50">
          <p>Feito com amor, entregue com carinho. Transformando momentos em doces memórias.</p>
          <p className="mt-2 text-sm text-amber-200">Uma empresa do Grupo Quintal dos Kitutes.</p>
        </div>
        <div className="flex justify-center space-x-6 mb-8">
            <a href="https://www.instagram.com/quintaldoskitutes?igsh=aXF4eG1kcjh5Z3Fo" target="_blank" rel="noopener noreferrer" className="hover:text-[#E5B8B8] transition-colors">Instagram</a>
            <a href="https://www.facebook.com/share/19kZyVqLjp/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E5B8B8] transition-colors">Facebook</a>
            <a href="https://wa.me/5511987789343" target="_blank" rel="noopener noreferrer" className="hover:text-[#E5B8B8] transition-colors">WhatsApp</a>
        </div>
        <div className="border-t border-amber-800 pt-6 text-sm text-amber-200">
          <p>&copy; {new Date().getFullYear()} Quintal dos Kitutes. Todos os direitos reservados.</p>
          <p>&copy; {new Date().getFullYear()} BoloFlix. Todos os direitos reservados.</p>
          <p>Um protótipo delicioso gerado por IA.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;