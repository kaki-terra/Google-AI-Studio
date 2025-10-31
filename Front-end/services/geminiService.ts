import { CakeCreation } from '../types';

// O backend agora é o único ponto de contato com a IA.
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';


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
 * Handles API errors from our backend, providing user-friendly messages.
 * @param error The error object caught.
 * @param context A string describing the action that failed.
 * @returns An instance of ApiError.
 */
const handleApiError = (error: any, context: string): ApiError => {
  console.error(`Error in ${context}:`, error);
  // Now we can expect more consistent errors from our own backend
  if (error instanceof ApiError) {
      return error;
  }
  return new ApiError(`Oops! Tivemos um probleminha na cozinha ao ${context}. Por favor, tente novamente.`);
};


// --- Funções refatoradas para chamar o BACKEND ---

export const generateInvestorPitch = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/investor-pitch`);
    if (!response.ok) throw new Error('Failed to fetch investor pitch');
    const data = await response.json();
    return data.pitch;
  } catch (error) {
    throw handleApiError(error, 'gerar o pitch para investidores');
  }
};

export const generateBusinessModelCanvas = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/business-model-canvas`);
    if (!response.ok) throw new Error('Failed to fetch business model canvas');
    const data = await response.json();
    return JSON.stringify(data.canvas); // Mantém o formato string JSON esperado pelo componente
  } catch (error) {
    throw handleApiError(error, 'gerar o Business Model Canvas');
  }
};

export const generateFinancialEstimate = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/financial-estimate`);
    if (!response.ok) throw new Error('Failed to fetch financial estimate');
    const data = await response.json();
    return data.estimate;
  } catch (error) {
    throw handleApiError(error, 'gerar a estimativa financeira');
  }
};

export const generateTestimonials = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    const data = await response.json();
    return JSON.stringify(data.testimonials); // Mantém o formato string JSON esperado pelo componente
  } catch (error) {
    throw handleApiError(error, 'gerar os depoimentos');
  }
};

export const generateCustomCakeDescription = async (creation: CakeCreation): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/custom-cake-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creation),
    });
    if (!response.ok) throw new Error('Failed to fetch custom cake description');
    const data = await response.json();
    return JSON.stringify(data.cake); // Mantém o formato string JSON esperado pelo componente
  } catch (error) {
    throw handleApiError(error, 'gerar a descrição do seu bolo');
  }
};