import React, { useState, useEffect } from 'react';
import { generateCakeOfTheMonth } from '../services/geminiService';
import { CakeOfTheMonth } from '../types';

const LoadingSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 animate-pulse">
        <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-lg"></div>
        <div className="w-full md:w-1/2 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="flex space-x-2 pt-4">
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="pt-4">
                <div className="h-12 bg-gray-300 rounded-lg w-1/2"></div>
            </div>
        </div>
    </div>
);

const CakeOfTheMonthSection: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
    const [cakeData, setCakeData] = useState<CakeOfTheMonth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCakeData = async () => {
            try {
                const { cakeDetails, imageUrl } = await generateCakeOfTheMonth();
                setCakeData({ ...cakeDetails, imageUrl });
            } catch (err) {
                console.error(err);
                setError("Não conseguimos buscar a delícia do mês. Por favor, tente recarregar a página.");
            } finally {
                setLoading(false);
            }
        };

        fetchCakeData();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-[#FDF3E9]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">A Delícia do Mês</h2>
                    <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Preparando uma surpresa especial para você...</p>
                    <LoadingSkeleton />
                </div>
            </section>
        );
    }
    
    if (error || !cakeData) {
        return (
            <section className="py-20 bg-[#FDF3E9]">
                 <div className="container mx-auto px-6 max-w-4xl text-center">
                    <p className="text-red-500">{error || "Ocorreu um erro."}</p>
                </div>
            </section>
        );
    }

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