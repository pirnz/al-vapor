// Types for the al-vapor steam calculator

export interface LocalizedString {
  es: string;
  en: string;
}

export interface Preparation {
  id: number;
  name: LocalizedString;
  time: number; // base minutes at medium fire
}

export interface Ingredient {
  id: number;
  name: LocalizedString;
  article: LocalizedString;
  time: number; // default time (fallback)
  checked: boolean;
  img: string;
  preparations: Preparation[];
}

export type Lang = 'en' | 'es';
export type Intensity = 1 | 2 | 3;

export interface OrderItem {
  ing: Ingredient;
  prep: Preparation;
  time: number;   // effective time after fire power applied
  addAt: number;  // minutes after start to add this ingredient (0 = first)
  maxTime: number; // total cooking duration
}

// Map of ingredientId → prepId
export type Selections = Map<number, number>;
