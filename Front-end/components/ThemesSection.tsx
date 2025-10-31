

import React from 'react';

const ThemeCard: React.FC<{ title: string; description: string; imageUrl: string }> = ({ title, description, imageUrl }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"/>
        <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-[#8D6E63]">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
        </div>
    </div>
);

const ThemesSection: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Cada mês, uma nova viagem de sabores!</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Nossos temas são criados para despertar memórias e apresentar novas delícias. Uma surpresa que você vai amar esperar.</p>
                <div className="grid md:grid-cols-3 gap-8">
                    <ThemeCard 
                        title="Sabores da Infância" 
                        description="Bolos de cenoura com chocolate, fubá com goiabada, formigueiro... um abraço em forma de sabor."
                        imageUrl="https://picsum.photos/seed/infancia/400/300"
                    />
                    <ThemeCard 
                        title="Festa Junina em Casa" 
                        description="Pamonha, milho com coco, paçoca. O arraiá vai ser na sua cozinha, com direito a muito sabor."
                        imageUrl="https://picsum.photos/seed/junina/400/300"
                    />
                    <ThemeCard 
                        title="Viagem pelo Brasil" 
                        description="Do bolo de rolo de Pernambuco ao cuca do Sul. Explore a confeitaria brasileira sem sair de casa."
                        imageUrl="https://picsum.photos/seed/brasil/400/300"
                    />
                </div>
            </div>
        </section>
    );
};

export default ThemesSection;