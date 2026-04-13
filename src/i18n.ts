import { writable, derived } from 'svelte/store';

export type Lang = 'es' | 'en';

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'es';
  const stored = localStorage.getItem('lang');
  if (stored === 'es' || stored === 'en') return stored as Lang;
  const navLang = (
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    ''
  ).toLowerCase();
  return navLang.startsWith('en') ? 'en' : 'es';
}

export const lang = writable<Lang>(getInitialLang());

lang.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lang', value);
  }
});

export const translations = {
  es: {
    title: 'Calculadora al vapor',
    infoTitle: '¿Cómo funciona?',
    infoItem1: 'Calcula el <b>tiempo óptimo de cocción al vapor</b> de cada ingrediente.',
    infoItem2: 'Te dice el <b>orden exacto en que añadirlos</b> para que todo quede listo a la vez.',
    infoCTA: '¡Elige tus ingredientes y descubre el orden perfecto!',
    clickForInfo: 'Ver información',
    estimatedTime: 'Tiempo total',
    minutes: 'minutos',
    wait: 'espera',
    minutesShort: 'min',
    done: '¡Todo listo!',
    intensity: 'Potencia',
    intensityLow: 'preciso',
    intensityHigh: 'más margen',
    footerMadeBy: 'Hecho por',
    emptyState: 'Selecciona ingredientes para ver el orden de cocción',
    salmon: 'Salmón',
    carrots: 'Zanahorias',
    broccoli: 'Brócoli en floretes',
    greenBeans: 'Judías verdes',
    potatoes: 'Patatas',
    brusselsSprouts: 'Coles de Bruselas',
    greenAsparagus: 'Espárragos verdes',
    eggs: 'Huevos',
    the: 'El/La/Los/Las',
  },
  en: {
    title: 'Steam Calculator',
    infoTitle: 'How does it work?',
    infoItem1: 'Calculates the <b>optimal steam cooking time</b> for each ingredient.',
    infoItem2: 'Tells you the <b>exact order to add them</b> so everything finishes at the same time.',
    infoCTA: 'Pick your ingredients and find the perfect cooking order!',
    clickForInfo: 'View info',
    estimatedTime: 'Total time',
    minutes: 'minutes',
    wait: 'wait',
    minutesShort: 'min',
    done: 'All done!',
    intensity: 'Intensity',
    intensityLow: 'precise',
    intensityHigh: 'more margin',
    footerMadeBy: 'Made by',
    emptyState: 'Select ingredients to see the cooking order',
    salmon: 'Salmon',
    carrots: 'Carrots',
    broccoli: 'Broccoli florets',
    greenBeans: 'Green beans',
    potatoes: 'Potatoes',
    brusselsSprouts: 'Brussels sprouts',
    greenAsparagus: 'Green asparagus',
    eggs: 'Eggs',
  }
} as const;

export const t = derived(lang, ($lang) => translations[$lang]);
