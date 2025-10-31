import { GoogleGenAI, Type } from "@google/genai";
import { QuizAnswers, CakeCreation } from '../types';

const API_KEY = process.env.API_KEY;

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

export const generateTasteProfile = async (answers: QuizAnswers): Promise<string> => {
  const prompt = `
    Baseado nestas preferências para bolos:
    - Vibe: ${answers.vibe}
    - Momento de consumo: ${answers.moment}
    - Preferência por frutas: ${answers.fruits}

    Crie um "Perfil de Sabor BoloFlix" divertido e acolhedor para este usuário em um único parágrafo.
    Depois, sugira um bolo caseiro delicioso que se encaixe perfeitamente neste perfil.
    
    Formate a resposta EXCLUSIVAMENTE como um objeto JSON com duas chaves: "profileDescription" e "cakeSuggestion".
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
            profileDescription: { type: Type.STRING, description: "A descrição do perfil de sabor do usuário." },
            cakeSuggestion: { type: Type.STRING, description: "A sugestão de bolo para o usuário." },
          },
        },
      },
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar seu perfil de sabor');
  }
};

export const generateCakeOfTheMonth = async (): Promise<{ cakeDetails: any; imageUrl: string }> => {
  try {
    // 1. Generate Cake Details
    const detailsResponse = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Crie os detalhes para o 'Bolo do Mês' da BoloFlix com o tema 'Sabores da Infância'. O bolo é de fubá com goiabada. Gere um nome criativo e fofo, uma descrição nostálgica de 2-3 frases, e 3 notas de sabor principais. Formate como JSON com chaves: "cakeName", "description", e "flavorNotes" (um array de strings).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cakeName: { type: Type.STRING },
            description: { type: Type.STRING },
            flavorNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    const cakeDetails = JSON.parse(detailsResponse.text);

    // 2. Generate Cake Image
    const imagePrompt = `Fotografia de comida de um bolo de fubá caseiro com pedaços de goiabada derretida por cima, muito apetitoso. O bolo está em uma louça de cerâmica vintage, sobre uma toalha de mesa xadrez em uma cozinha rústica e ensolarada. Estilo de fotografia acolhedor e nostálgico, com foco suave no fundo.`;
    
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '4:3',
        },
    });

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    
    return { cakeDetails, imageUrl };

  } catch (error) {
    throw handleApiError(error, 'gerar o bolo do mês');
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

export const checkDeliveryAvailability = async (day: string, time: string): Promise<{ available: boolean; message: string; }> => {
  const prompt = `
    Aja como um sistema de logística para a 'BoloFlix'. Um cliente quer agendar uma entrega para ${day} no período da ${time}.
    Sua tarefa é determinar a disponibilidade e fornecer uma mensagem amigável.

    Responda EXCLUSIVAMENTE com um objeto JSON com duas chaves: "available" (um booleano) e "message" (uma string com a resposta para o cliente).

    - Na maioria das vezes (cerca de 80% das vezes), a entrega deve estar disponível. A mensagem deve ser positiva. Ex: "Ótima notícia! Temos entregadores disponíveis para ${day} no período da ${time}."
    - Ocasionalmente (cerca de 20% das vezes), a entrega deve estar indisponível. A mensagem deve ser amigável e sugerir uma alternativa. Ex: "Puxa! Nossas entregas para ${day} pela ${time} já estão lotadas. Que tal na parte da tarde?"
    - Varie um pouco as mensagens para parecer natural.
    - Não inclua markdown (como \`\`\`json) na resposta.
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
            available: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
          },
          required: ["available", "message"],
        },
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    throw handleApiError(error, 'verificar a disponibilidade');
  }
};

export const generateWelcomeMessage = async (planTitle: string, customerName: string, deliveryDay: string): Promise<string> => {
  const prompt = `
    Aja como a voz da marca 'BoloFlix'. Um novo cliente chamado(a) "${customerName}" acabou de assinar o plano "${planTitle}".
    A primeira entrega dele(a) está agendada para acontecer toda "${deliveryDay}".
    Escreva uma mensagem de boas-vindas curta (2-3 frases), calorosa e comemorativa.
    Use um tom nostálgico e amigável, como se estivesse recebendo um novo membro na família.
    Mencione o nome do cliente, o plano e confirme o dia da entrega para personalizar a mensagem.
  `;
  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    throw handleApiError(error, 'gerar a mensagem de boas-vindas');
  }
};