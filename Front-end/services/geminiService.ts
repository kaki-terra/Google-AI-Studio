import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CakeCreation } from '../types';

// CORREÇÃO: No frontend (Vite), as variáveis de ambiente devem ser acessadas com `import.meta.env`
// e prefixadas com VITE_ por segurança.
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;

/**
 * Custom error class for API-related issues.
 */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handles API errors, providing user-friendly messages.
 * @param error The error object caught.
 * @param context A string describing the action that failed (e.g., 'gerar o pitch').
 * @returns An instance of ApiError.
 */
const handleApiError = (error: any, context: string): ApiError => {
  console.error(`Error in ${context}:`, error);
  if (error && typeof error.message === 'string' && error.message.includes('429')) {
    return new ApiError('Parece que atingimos nosso limite de doçura por agora! (Limite de API excedido). Por favor, verifique seu plano e faturamento e tente novamente mais tarde.');
  }
  return new ApiError(`Oops! Tivemos um probleminha na cozinha ao ${context}. Por favor, tente novamente.`);
};

export const generateInvestorPitch = async (): Promise<string> => {
  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Crie um pitch de apresentação conciso e persuasivo para investidores da 'BoloFlix', um serviço de assinatura de bolos caseiros. A identidade da marca é nostálgica, acolhedora e familiar, com uma paleta de cores creme, marrom claro e rosa pastel. Destaque o conceito de "Netflix de bolos", os temas mensais surpresa e os diferentes planos de assinatura. Formate a resposta usando markdown para títulos e listas.`,
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar o pitch para investidores');
  }
};

export const generateBusinessModelCanvas = async (): Promise<string> => {
  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Gere um Business Model Canvas para a 'BoloFlix', um serviço de assinatura de bolos caseiros. O público-alvo são famílias e pessoas que apreciam comida caseira e nostálgica. O serviço oferece entregas semanais/mensais com caixas temáticas. A monetização é através de planos de assinatura.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyPartners: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyResources: { type: Type.ARRAY, items: { type: Type.STRING } },
            valuePropositions: { type: Type.ARRAY, items: { type: Type.STRING } },
            customerRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
            channels: { type: Type.ARRAY, items: { type: Type.STRING } },
            customerSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
            costStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
            revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar o Business Model Canvas');
  }
};


export const generateFinancialEstimate = async (): Promise<string> => {
  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Forneça uma estimativa financeira básica para o primeiro ano da 'BoloFlix', um serviço de assinatura de bolos. Considere três planos: 'Curioso' (R$60/mês, 50 assinantes), 'Apaixonado' (R$120/mês, 30 assinantes) e 'Família' (R$200/mês, 20 assinantes). Estime os custos mensais para ingredientes, embalagens, entrega, marketing e um pequeno salário. Calcule a receita mensal projetada, custos totais e lucro líquido. Apresente o resultado em formato markdown, de forma clara e simples.`,
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar a estimativa financeira');
  }
};

export const generateTestimonials = async (): Promise<string> => {
  const prompt = `
    Gere 3 depoimentos de clientes para a 'BoloFlix', um serviço de assinatura de bolos caseiros.
    O tom deve ser caloroso, pessoal e nostálgico, reforçando os valores de família e aconchego.
    Cada depoimento deve ter uma citação (quote), o nome do autor (author) e o bolo favorito dele (favoriteCake).

    Formate a resposta EXCLUSIVAMENTE como um array de objetos JSON, onde cada objeto tem as chaves: "quote", "author", e "favoriteCake".
    Não inclua markdown (como \`\`\`json) na resposta.
  `;
  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING },
              author: { type: Type.STRING },
              favoriteCake: { type: Type.STRING },
            },
            required: ["quote", "author", "favoriteCake"],
          },
        },
      },
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar os depoimentos');
  }
};

export const generateCustomCakeDescription = async (creation: CakeCreation): Promise<string> => {
  const prompt = `
    Um cliente da BoloFlix montou um bolo personalizado com as seguintes características:
    - Massa: ${creation.base}
    - Recheio: ${creation.filling}
    - Cobertura: ${creation.topping}
    
    Sua tarefa é agir como um mestre confeiteiro criativo e nostálgico. Crie um nome único e um parágrafo de descrição para este bolo. O nome deve ser divertido e a descrição deve ser acolhedora, despertando a vontade de experimentar.

    Formate a resposta EXCLUSIVAMENTE como um objeto JSON com duas chaves: "cakeName" e "description".
    Não inclua markdown (como \`\`\`json) na resposta.
  `;
  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cakeName: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["cakeName", "description"],
        },
      },
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar a descrição do seu bolo');
  }
};