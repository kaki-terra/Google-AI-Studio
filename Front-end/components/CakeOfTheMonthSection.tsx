import React from 'react';
import { CakeOfTheMonth } from '../types';

// Dados estáticos para o Bolo do Mês para evitar chamadas de API no carregamento da página.
const staticCakeData: CakeOfTheMonth = {
  cakeName: "Lembrança de Fubá com Goiabada",
  description: "Uma receita clássica que abraça a alma. A massa fofinha de fubá encontra o doce derretido da goiabada, criando uma combinação perfeita para o café da tarde.",
  flavorNotes: ["Aconchegante", "Doce na medida certa", "Textura macia"],
  imageUrl: "https://picsum.photos/seed/fuba-goiabada/800/600" // Usando uma imagem estática
};


const CakeOfTheMonthSection: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
    const cakeData = staticCakeData;

    return (
        <section className="py-20 bg-[#FDF3E9]">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">A Delícia do Mês</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Todo mês, uma nova criação para despertar suas melhores memórias. Este mês, apresentamos:</p>
                
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2">
                        <img 
                            src={cakeData.imageUrl} 
                            alt={cakeData.cakeName}
                            className="object-cover w-full h-full min-h-[300px]"
                        />
                    </div>
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-[#D99A9A] uppercase">Tema: Sabores da Infância</p>
                        <h3 className="text-3xl font-bold my-2 text-[#8D6E63]">{cakeData.cakeName}</h3>
                        <p className="text-gray-600 mb-4">{cakeData.description}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {cakeData.flavorNotes.map((note, index) => (
                                <span key={index} className="bg-[#FFE4E4] text-[#D99A9A] text-xs font-semibold px-3 py-1 rounded-full">{note}</span>
                            ))}
                        </div>
                        <button
                            onClick={onOpenModal}
                            className="bg-[#E5B8B8] text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#D99A9A] transition-transform hover:scale-105 shadow-lg w-full sm:w-auto"
                            aria-label="Assinar para receber o bolo do mês"
                        >
                            Quero essa delícia!
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CakeOfTheMonthSection;