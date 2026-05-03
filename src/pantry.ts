import type { Ingredient } from './types';

export const pantry: Ingredient[] = [
  {
    id: 0,
    name: { es: 'Salmón', en: 'Salmon' },
    article: { es: 'El', en: 'The' },
    time: 10,
    checked: false,
    img: 'salmon.jpg',
    preparations: [
      { id: 0, name: { es: 'normal', en: 'fillet' }, time: 10 },
    ],
  },
  {
    id: 1,
    name: { es: 'Zanahorias', en: 'Carrots' },
    article: { es: 'Las', en: 'The' },
    time: 18,
    checked: false,
    img: 'zanahoria.svg',
    preparations: [
      { id: 0, name: { es: 'trozos', en: 'chopped' }, time: 15 },
      { id: 1, name: { es: 'enteras', en: 'whole' }, time: 18 },
    ],
  },
  {
    id: 2,
    name: { es: 'Brócoli en floretes', en: 'Broccoli florets' },
    article: { es: 'El', en: 'The' },
    time: 8,
    checked: false,
    img: 'brocoli.svg',
    preparations: [
      { id: 0, name: { es: 'normal', en: 'florets' }, time: 8 },
    ],
  },
  {
    id: 3,
    name: { es: 'Judías verdes', en: 'Green beans' },
    article: { es: 'Las', en: 'The' },
    time: 13,
    checked: false,
    img: 'judias-verdes.svg',
    preparations: [
      { id: 0, name: { es: 'trozos', en: 'chopped' }, time: 11 },
      { id: 1, name: { es: 'enteras', en: 'whole' }, time: 14 },
    ],
  },
  {
    id: 4,
    name: { es: 'Patatas', en: 'Potatoes' },
    article: { es: 'Las', en: 'The' },
    time: 40,
    checked: false,
    img: 'patata.svg',
    preparations: [
      { id: 0, name: { es: 'trozos', en: 'cubed' }, time: 20 },
      { id: 1, name: { es: 'enteras', en: 'whole' }, time: 40 },
    ],
  },
  {
    id: 5,
    name: { es: 'Coles de Bruselas', en: 'Brussels sprouts' },
    article: { es: 'Las', en: 'The' },
    time: 12,
    checked: false,
    img: 'coles-de-bruselas.webp',
    preparations: [
      { id: 0, name: { es: 'mitades', en: 'halved' }, time: 8 },
      { id: 1, name: { es: 'enteras', en: 'whole' }, time: 12 },
    ],
  },
  {
    id: 7,
    name: { es: 'Espárragos verdes', en: 'Green asparagus' },
    article: { es: 'Los', en: 'The' },
    time: 7,
    checked: false,
    img: 'esparragos-verdes.svg',
    preparations: [
      { id: 0, name: { es: 'mitades', en: 'halved' }, time: 5 },
      { id: 1, name: { es: 'enteros', en: 'whole' }, time: 7 },
    ],
  },
  {
    id: 8,
    name: { es: 'Huevos', en: 'Eggs' },
    article: { es: 'Los', en: 'The' },
    time: 9,
    checked: false,
    img: 'eggs.png',
    preparations: [
      { id: 0, name: { es: 'yema cremosa', en: 'soft yolk' }, time: 7 },
      { id: 2, name: { es: 'en su punto', en: 'medium' }, time: 9 },
      { id: 3, name: { es: 'muy hecho', en: 'hard boiled' }, time: 12 },
    ],
  },
];
