export interface BusinessModelCanvas {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface QuizAnswers {
  vibe: string;
  moment: string;
  fruits: string;
}

export interface TasteProfile {
  profileDescription: string;
  cakeSuggestion: string;
}

export interface CakeOfTheMonth {
  cakeName: string;
  description: string;
  flavorNotes: string[];
  imageUrl: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  favoriteCake: string;
}

export interface CakeCreation {
  base?: string;
  filling?: string;
  topping?: string;
}

export interface GeneratedCake {
  cakeName: string;
  description: string;
}

export interface Plan {
  title: string;
  price: string;
}

// Fix for: Property 'env' does not exist on type 'ImportMeta'.
// By adding this, we inform TypeScript about the shape of `import.meta.env`
// which is a feature provided by Vite. The types are defined as potentially
// undefined to match runtime behavior. This resolves the type errors in
// services/geminiService.ts and components/CheckoutModal.tsx without adding new files.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_KEY: string | undefined;
      readonly VITE_BACKEND_URL: string | undefined;
    };
  }
}
