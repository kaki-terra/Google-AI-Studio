import React, { useState } from 'react';
import { 
    generateBusinessModelCanvas, 
    generateFinancialEstimate, 
    generateInvestorPitch 
} from '../services/geminiService';
import { BusinessModelCanvas } from '../types';

const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="space-y-3 animate-pulse">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
);

const CanvasBlock: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100 h-full">
        <h4 className="font-bold text-sm text-[#8D6E63] mb-2 border-b border-pink-200 pb-1">{title}</h4>
        <ul className="text-xs text-gray-600 space-y-1">
            {items.map((item, index) => <li key={index}>- {item}</li>)}
        </ul>
    </div>
);

const BusinessModelSection: React.FC = () => {
    const [pitch, setPitch] = useState<string>('');
    const [canvas, setCanvas] = useState<BusinessModelCanvas | null>(null);
    const [estimate, setEstimate] = useState<string>('');
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string | null>>({});

    const handleGenerate = async (type: 'pitch' | 'canvas' | 'estimate') => {
        setLoading(prev => ({ ...prev, [type]: true }));
        setError(prev => ({ ...prev, [type]: null }));

        try {
            if (type === 'pitch') {
                const result = await generateInvestorPitch();
                setPitch(result);
            } else if (type === 'canvas') {
                const resultString = await generateBusinessModelCanvas();
                setCanvas(JSON.parse(resultString));
            } else if (type === 'estimate') {
                const result = await generateFinancialEstimate();
                setEstimate(result);
            }
        } catch (err: any) {
            console.error(err);
            setError(prev => ({ ...prev, [type]: err.message || 'Falha ao gerar conteúdo.' }));
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };
    
    return (
        <section className="py-20 bg-[#FFF9F2]">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Por Dentro da BoloFlix</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Gerado por IA, nosso modelo de negócio é tão delicioso quanto nossos bolos. Veja os detalhes!</p>

                <div className="space-y-12">
                    {/* Investor Pitch */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <h3 className="text-2xl font-bold text-[#8D6E63] mb-4">Elevator Pitch para Investidores</h3>
                        {loading.pitch ? <LoadingSkeleton /> : error.pitch ? <p className="text-red-500">{error.pitch}</p> : (
                            <p className="text-gray-600 whitespace-pre-line">{pitch || 'Clique no botão para gerar o pitch.'}</p>
                        )}
                        <button onClick={() => handleGenerate('pitch')} disabled={loading.pitch} className="mt-6 bg-[#E5B8B8] text-white px-6 py-2 rounded-full hover:bg-[#D99A9A] transition-colors disabled:bg-gray-300">
                            {loading.pitch ? 'Gerando...' : 'Gerar Pitch'}
                        </button>
                    </div>

                    {/* Business Model Canvas */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <h3 className="text-2xl font-bold text-[#8D6E63] mb-6">Business Model Canvas</h3>
                         {loading.canvas ? <div className="text-center p-8"><LoadingSkeleton rows={10} /></div> : error.canvas ? <p className="text-red-500">{error.canvas}</p> : (
                            canvas ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-1"><CanvasBlock title="Parceiros Chave" items={canvas.keyPartners} /></div>
                                    <div className="lg:col-span-1 space-y-4">
                                        <CanvasBlock title="Atividades Chave" items={canvas.keyActivities} />
                                        <CanvasBlock title="Recursos Chave" items={canvas.keyResources} />
                                    </div>
                                    <div className="lg:col-span-1"><CanvasBlock title="Proposta de Valor" items={canvas.valuePropositions} /></div>
                                    <div className="lg:col-span-1 space-y-4">
                                        <CanvasBlock title="Relação com Clientes" items={canvas.customerRelationships} />
                                        <CanvasBlock title="Canais" items={canvas.channels} />
                                        <CanvasBlock title="Segmentos de Clientes" items={canvas.customerSegments} />
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 mt-4 pt-4 border-t-2 border-dashed border-pink-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <CanvasBlock title="Estrutura de Custos" items={canvas.costStructure} />
                                         <CanvasBlock title="Fontes de Receita" items={canvas.revenueStreams} />
                                    </div>
                                </div>
                            ) : <p className="text-center text-gray-500">Clique no botão para gerar o Business Model Canvas.</p>
                        )}
                        <div className="text-center">
                            <button onClick={() => handleGenerate('canvas')} disabled={loading.canvas} className="mt-6 bg-[#E5B8B8] text-white px-6 py-2 rounded-full hover:bg-[#D99A9A] transition-colors disabled:bg-gray-300">
                                {loading.canvas ? 'Gerando...' : 'Gerar Canvas'}
                            </button>
                        </div>
                    </div>

                    {/* Financial Estimate */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <h3 className="text-2xl font-bold text-[#8D6E63] mb-4">Estimativa Financeira Simplificada (1º Ano)</h3>
                         {loading.estimate ? <LoadingSkeleton /> : error.estimate ? <p className="text-red-500">{error.estimate}</p> : (
                            <p className="text-gray-600 whitespace-pre-line">{estimate || 'Clique no botão para gerar a estimativa.'}</p>
                        )}
                        <button onClick={() => handleGenerate('estimate')} disabled={loading.estimate} className="mt-6 bg-[#E5B8B8] text-white px-6 py-2 rounded-full hover:bg-[#D99A9A] transition-colors disabled:bg-gray-300">
                           {loading.estimate ? 'Gerando...' : 'Gerar Estimativa'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BusinessModelSection;
