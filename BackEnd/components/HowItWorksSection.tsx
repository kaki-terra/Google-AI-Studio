

import React from 'react';

const StepCard: React.FC<{ number: string; title: string; description: string; children: React.ReactNode }> = ({ number, title, description, children }) => (
  <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-pink-100 transform hover:-translate-y-2 transition-transform duration-300">
    <div className="flex items-center justify-center h-20 w-20 rounded-full bg-[#FFE4E4] mx-auto mb-6 text-3xl font-bold text-[#D99A9A]">
      {children}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-[#8D6E63]">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Como a mágica acontece?</h2>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Em apenas 3 passos, o cheirinho de bolo caseiro invade a sua casa.</p>
        <div className="grid md:grid-cols-3 gap-10">
          <StepCard number="1" title="Escolha seu plano" description="Seja para matar a curiosidade ou para a família toda, temos o plano perfeito para você.">
            <span>1</span>
          </StepCard>
          <StepCard number="2" title="Conte suas preferências" description="Doce ou fit? Com ou sem lactose? A gente se adapta ao seu paladar para uma surpresa deliciosa.">
            <span>2</span>
          </StepCard>
          <StepCard number="3" title="Receba e se delicie" description="Relaxe e espere. Seu bolo fresquinho, feito com amor, chegará na sua porta toda semana.">
            <span>3</span>
          </StepCard>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;