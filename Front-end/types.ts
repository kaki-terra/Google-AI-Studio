import { Session, User } from '@supabase/supabase-js';

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

// Re-export Supabase types for convenience
export type { Session, User };


// Fix for: Property 'env' does not exist on type 'ImportMeta'.
// By adding this, we inform TypeScript about the shape of `import.meta.env`
// which is a feature provided by Vite. 
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_KEY: string | undefined;
      readonly VITE_BACKEND_URL: string | undefined;
      readonly VITE_SUPABASE_URL: string | undefined;
      readonly VITE_SUPABASE_ANON_KEY: string | undefined;
    };
  }
}