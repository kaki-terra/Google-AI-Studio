import React from 'react';
import { Plan } from '../types';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const PlanCard: React.FC<{ title: string; price: string; description: string; features: string[]; popular?: boolean; onSelectPlan: () => void; }> = ({ title, price, description, features, popular, onSelectPlan }) => (
    <div className={`relative bg-white rounded-2xl p-8 border ${popular ? 'border-[#D99A9A] border-2 shadow-2xl' : 'border-gray-200 shadow-lg'} flex flex-col`}>
        {popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#D99A9A] text-white text-xs font-bold px-4 py-1 rounded-full">MAIS POPULAR</div>}
        <h3 className="text-2xl font-bold text-center text-[#8D6E63]">{title}</h3>
        <p className="text-center text-gray-500 mt-2 mb-6">{description}</p>
        <p className="text-center my-4">
            <span className="text-5xl font-extrabold text-[#5D4037]">R${price}</span>
            <span className="text-gray-500">/mês</span>
        </p>
        <ul className="space-y-4 mb-8 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start">
                    <CheckIcon />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button 
            onClick={onSelectPlan}
            className={`w-full mt-auto py-3 px-6 rounded-lg font-semibold transition-transform hover:scale-105 ${popular ? 'bg-[#E5B8B8] text-white hover:bg-[#D99A9A]' : 'bg-[#FFE4E4] text-[#D99A9A] hover:bg-[#ffc6c6]'}`}
        >
            Assinar Agora
        </button>
    </div>
);


const PlansSection: React.FC<{ onSelectPlan: (plan: Plan) => void }> = ({ onSelectPlan }) => {
    return (
        <section className="py-20 bg-[#FFF9F2]">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Um plano para cada tamanho de vontade</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Escolha o seu pedaço de felicidade e comece a receber amor em forma de bolo.</p>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                    <PlanCard 
                        title="Bolo Curioso" 
                        price="60"
                        description="Para quem quer experimentar um docinho na semana."
                        features={[
                            "1 bolo caseiro por mês",
                            "Sabores tradicionais",
                            "Acesso à comunidade"
                        ]}
                        onSelectPlan={() => onSelectPlan({ title: 'Bolo Curioso', price: '60' })}
                    />
                    <PlanCard 
                        title="Bolo Apaixonado" 
                        price="120"
                        description="A dose semanal de carinho que você merece."
                        features={[
                            "1 bolo caseiro por semana",
                            "Escolha de estilo (tradicional, fit, etc)",
                            "Acesso aos temas mensais",
                            "Mimos surpresa na caixa"
                        ]}
                        popular
                        onSelectPlan={() => onSelectPlan({ title: 'Bolo Apaixonado', price: '120' })}
                    />
                    <PlanCard 
                        title="Família BoloFlix" 
                        price="200"
                        description="Para dividir com quem você ama (ou não!)."
                        features={[
                            "2 bolos por semana",
                            "Todos os benefícios do Apaixonado",
                            "Opções gourmet exclusivas",
                            "Prioridade na escolha de temas"
                        ]}
                        onSelectPlan={() => onSelectPlan({ title: 'Família BoloFlix', price: '200' })}
                    />
                </div>
            </div>
        </section>
    );
};

export default PlansSection;