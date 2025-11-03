

import React, { useState, useEffect, useCallback } from 'react';
import { generateBusinessModelCanvas } from '../services/geminiService';
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

// --- Static Content ---
const staticPitchContent = `BoloFlix é a sua confeitaria caseira por assinatura. Cansado dos mesmos doces industriais? Nós entregamos, semanalmente, um bolo fresquinho, com sabor de infância e feito com amor, diretamente na sua porta. Com temas mensais que surpreendem e resgatam memórias, transformamos o simples ato de comer bolo em uma experiência de carinho e descoberta. BoloFlix: o abraço que chega em uma caixa.`;

const staticFinanceContent = `## Estimativa Financeira Simplificada (1º Ano)

### Premissas:
- **Mix de Clientes:** 40% no Plano Curioso, 50% no Apaixonado, 10% no Família.
- **Custo por Bolo (CMV):** R$ 25 (incluindo ingredientes e embalagem).
- **Custos Fixos Mensais:** R$ 2.000 (marketing inicial, plataforma, etc).

### Projeção com 50 Assinantes:
- **Receita Mensal:** (20 * R$60) + (25 * R$120) + (5 * R$200) = R$ 1.200 + R$ 3.000 + R$ 1.000 = **R$ 5.200**
- **Custo Variável Mensal:** ((20*1) + (25*4) + (5*8)) * R$25 = 160 bolos * R$25 = **R$ 4.000**
- **Lucro Bruto Mensal:** R$ 5.200 - R$ 4.000 = R$ 1.200
- **Resultado Mensal:** R$ 1.200 - R$ 2.000 = **-R$ 800**

### Projeção com 100 Assinantes:
- **Receita Mensal:** (40 * R$60) + (50 * R$120) + (10 * R$200) = R$ 2.400 + R$ 6.000 + R$ 2.000 = **R$ 10.400**
- **Custo Variável Mensal:** ((40*1) + (50*4) + (10*8)) * R$25 = 320 bolos * R$25 = **R$ 8.000**
- **Lucro Bruto Mensal:** R$ 10.400 - R$ 8.000 = R$ 2.400
- **Resultado Mensal:** R$ 2.400 - R$ 2.000 = **+R$ 400**

**Conclusão:** O ponto de equilíbrio (break-even) do modelo é alcançado com aproximadamente 85-90 assinantes. O foco inicial deve ser a aquisição de clientes para garantir a sustentabilidade e, a partir daí, escalar o lucro otimizando custos.`;


const BusinessModelSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('pitch');
    const [canvasContent, setCanvasContent] = useState<BusinessModelCanvas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchCanvas = useCallback(async () => {
        // Apenas busca o canvas se ele ainda não foi carregado
        if (canvasContent) return;

        setLoading(true);
        setError(null);
        try {
            const resultString = await generateBusinessModelCanvas();
            const data = JSON.parse(resultString);
            setCanvasContent(data);
        } catch (err) {
            const apiError = err as Error;
            setError(apiError.message || "Falha ao buscar dados da IA. Tente recarregar a página.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [canvasContent]);

    useEffect(() => {
        // Carrega o canvas apenas quando a aba é selecionada pela primeira vez
        if (activeTab === 'canvas') {
            fetchCanvas();
        }
    }, [activeTab, fetchCanvas]);

    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm md:text-base font-semibold rounded-t-lg transition-colors ${
                activeTab === tab 
                ? 'bg-white text-[#D99A9A] border-b-2 border-transparent' 
                : 'bg-transparent text-gray-500 hover:bg-pink-50'
            }`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'pitch':
                return <MarkdownRenderer content={staticPitchContent} />;
            case 'canvas':
                 if (loading) return <LoadingSpinner />;
                 if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
                return canvasContent ? <CanvasDisplay data={canvasContent} /> : <div className="text-center p-8">Não foi possível exibir o Canvas.</div>;
            case 'finance':
                return <MarkdownRenderer content={staticFinanceContent} />;
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