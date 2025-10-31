import React from 'react';

const HeroSection: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#FFFAF0] to-[#FFF9F2]">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center mb-8">
            <img src="https://picsum.photos/seed/boloflix-logo/300/300" alt="Novo logo da BoloFlix com uma fatia de bolo e um ramo de trigo" className="rounded-full shadow-2xl w-64 h-64 object-cover border-8 border-white"/>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#8D6E63]">
          O carinho do bolo de vó, <br /> toda semana na sua casa.
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-600">
          Redescubra sabores, crie memórias e transforme sua rotina com a <span className="font-brand text-2xl text-[#D99A9A]">BoloFlix</span>. A sua assinatura de felicidade caseira.
        </p>
        <button
          onClick={onOpenModal}
          className="bg-[#E5B8B8] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#D99A9A] transition-transform hover:scale-105 shadow-lg"
          aria-label="Iniciar o quiz de preferências"
        >
          Quero meu bolo!
        </button>
      </div>
    </section>
  );
};

export default HeroSection;