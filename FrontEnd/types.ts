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
