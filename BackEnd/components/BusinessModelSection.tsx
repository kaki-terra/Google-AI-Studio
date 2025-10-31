

import React, { useState, useEffect, useCallback } from 'react';
import { generateInvestorPitch, generateBusinessModelCanvas, generateFinancialEstimate } from '../services/geminiService';
import { BusinessModelCanvas } from '../types';

type Tab = 'pitch' | 'canvas' | 'finance';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D99A9A]"></div>
    </div>
);

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderContent = () => {
        return content
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-[#8D6E63]">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-[#8D6E63]">{line.substring(3)}</h2>;
                }
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-[#8D6E63]">{line.substring(2)}</h1>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
                }
                 if (line.trim() === '') {
                    return <br key={index} />;
                }
                return <p key={index} className="mb-2">{line}</p>;
            });
    };

    return <div className="prose max-w-none text-left">{renderContent()}</div>;
};

const CanvasDisplay: React.FC<{ data: BusinessModelCanvas }> = ({ data }) => {
    const sections: { title: string; items: string[] | undefined }[] = [
        { title: 'Parceiros-Chave', items: data.keyPartners },
        { title: 'Atividades-Chave', items: data.keyActivities },
        { title: 'Recursos-Chave', items: data.keyResources },
        { title: 'Propostas de Valor', items: data.valuePropositions },
        { title: 'Relacionamento com Clientes', items: data.customerRelationships },
        { title: 'Canais', items: data.channels },
        { title: 'Segmentos de Clientes', items: data.customerSegments },
        { title: 'Estrutura de Custos', items: data.costStructure },
        { title: 'Fontes de Receita', items: data.revenueStreams },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map(section => (
                <div key={section.title} className="bg-[#FFF9F2] p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-lg mb-2 text-[#8D6E63]">{section.title}</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {section.items?.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            ))}
        </div>
    );
};

const BusinessModelSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('pitch');
    const [pitchContent, setPitchContent] = useState<string>('');
    const [canvasContent, setCanvasContent] = useState<BusinessModelCanvas | null>(null);
    const [financeContent, setFinanceContent] = useState<string>('');
    const [loading, setLoading] = useState<Record<Tab, boolean>>({ pitch: true, canvas: true, finance: true });
    const [error, setError] = useState<string | null>(null);
    
    const fetchData = useCallback(async (tab: Tab) => {
        setLoading(prev => ({ ...prev, [tab]: true }));
        setError(null);
        try {
            if (tab === 'pitch') {
                const content = await generateInvestorPitch();
                setPitchContent(content);
            } else if (tab === 'canvas') {
                const content = await generateBusinessModelCanvas();
                 try {
                    const parsedContent = JSON.parse(content);
                    setCanvasContent(parsedContent);
                 } catch (e) {
                     setError("Erro ao processar o formato do Canvas. O conteúdo pode ser inválido.");
                     console.error("JSON parsing error:", e, "Content:", content);
                 }
            } else if (tab === 'finance') {
                const content = await generateFinancialEstimate();
                setFinanceContent(content);
            }
        } catch (err) {
            setError('Falha ao buscar dados da IA. Verifique sua chave de API e tente novamente.');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, [tab]: false }));
        }
    }, []);

    useEffect(() => {
        fetchData('pitch');
        fetchData('canvas');
        fetchData('finance');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm md:text-base font-semibold rounded-t-lg transition-colors ${
                activeTab === tab 
                ? 'bg-white text-[#D99A9A] border-b-2 border-[#D99A9A]' 
                : 'bg-transparent text-gray-500 hover:bg-pink-50'
            }`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        if (loading[activeTab]) return <LoadingSpinner />;
        if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

        switch (activeTab) {
            case 'pitch':
                return <MarkdownRenderer content={pitchContent} />;
            case 'canvas':
                return canvasContent ? <CanvasDisplay data={canvasContent} /> : <p>Não foi possível exibir o Canvas.</p>;
            case 'finance':
                return <MarkdownRenderer content={financeContent} />;
            default:
                return null;
        }
    };

    return (
        <section className="py-20 bg-[#FFF9F2]">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Materializando a ideia</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">Com a ajuda da IA, transformamos o conceito em um plano de negócio estruturado.</p>
                <div className="max-w-4xl mx-auto">
                    <div className="border-b border-gray-200 mb-6 flex justify-center space-x-2 md:space-x-4">
                        <TabButton tab="pitch" label="Pitch de Apresentação" />
                        <TabButton tab="canvas" label="Business Model Canvas" />
                        <TabButton tab="finance" label="Estimativa Financeira" />
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 min-h-[400px]">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BusinessModelSection;