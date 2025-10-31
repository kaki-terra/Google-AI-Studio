import React, { useState } from 'react';
import { generateCustomCakeDescription } from '../services/geminiService';
import { CakeCreation, GeneratedCake } from '../types';

const cakeOptions = {
    base: ['Baunilha Fofinha', 'Chocolate Intenso', 'Cenoura com Especiarias', 'Fubá Cremoso'],
    filling: ['Doce de Leite', 'Brigadeiro de Panela', 'Geleia de Frutas Vermelhas', 'Ninho Trufado'],
    topping: ['Ganache de Chocolate', 'Crocante de Castanhas', 'Raspas de Limão', 'Açúcar de Confeiteiro'],
};

type Category = keyof typeof cakeOptions;

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-48 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#D99A9A]"></div>
        <p className="mt-4 text-md text-[#8D6E63]">Batendo a massa e assando as ideias...</p>
    </div>
);

const CreateYourOwnCakeSection: React.FC = () => {
    const [creation, setCreation] = useState<CakeCreation>({});
    const [generatedCake, setGeneratedCake] = useState<GeneratedCake | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelect = (category: Category, option: string) => {
        setCreation(prev => ({ ...prev, [category]: option }));
        setGeneratedCake(null); // Reset result when a new selection is made
    };

    const handleSubmit = async () => {
        if (!creation.base || !creation.filling || !creation.topping) return;
        setLoading(true);
        setError(null);
        setGeneratedCake(null);
        try {
            const resultString = await generateCustomCakeDescription(creation);
            setGeneratedCake(JSON.parse(resultString));
        } catch (err) {
            console.error(err);
            setError("Oops! O forno da criatividade deu uma pequena esfriada. Tente novamente!");
        } finally {
            setLoading(false);
        }
    };

    const isComplete = creation.base && creation.filling && creation.topping;

    return (
        <section className="py-20 bg-[#FDF3E9]">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Meu Bolo, Minhas Regras!</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Solte a imaginação, monte sua combinação perfeita e veja a mágica acontecer.</p>

                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        {Object.entries(cakeOptions).map(([category, options]) => (
                            <div key={category}>
                                <h3 className="text-xl font-semibold mb-4 text-[#8D6E63] capitalize">
                                    {category === 'base' ? '1. Escolha a Massa' : category === 'filling' ? '2. Escolha o Recheio' : '3. Escolha a Cobertura'}
                                </h3>
                                <div className="space-y-3">
                                    {options.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleSelect(category as Category, option)}
                                            className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all duration-200 ${creation[category as Category] === option ? 'bg-[#E5B8B8] border-[#D99A9A] text-white font-semibold shadow-md' : 'bg-white border-gray-200 hover:border-[#D99A9A] hover:bg-pink-50'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={!isComplete || loading}
                            className="px-10 py-4 rounded-lg font-semibold text-white bg-[#D99A9A] hover:bg-[#BF8B8B] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                            {loading ? 'Criando sua delícia...' : 'Gerar Meu Bolo!'}
                        </button>
                    </div>

                    {loading && <LoadingSpinner />}
                    
                    {error && <p className="text-center text-red-500 mt-6">{error}</p>}
                    
                    {generatedCake && !loading && (
                        <div className="mt-10 pt-8 border-t-2 border-dashed border-pink-200 text-center">
                            <h3 className="text-2xl font-bold text-[#8D6E63]">Sua criação deliciosa:</h3>
                            <p className="font-brand text-4xl text-[#D99A9A] my-4">{generatedCake.cakeName}</p>
                            <p className="max-w-xl mx-auto text-gray-600">{generatedCake.description}</p>
                            <button className="mt-6 bg-[#FFE4E4] text-[#D99A9A] font-semibold px-6 py-2 rounded-full hover:bg-[#ffc6c6] transition-colors">
                                Sugerir para a BoloFlix!
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CreateYourOwnCakeSection;