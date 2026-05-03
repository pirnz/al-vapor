import type { Ingredient, Intensity, OrderItem, Selections } from '../types';

// Fire power multipliers:
//   Low (1)    → longer times ×1.3  — gentle simmer
//   Medium (2) → base times   ×1.0
//   High (3)   → shorter times ×0.75 — rolling boil
const POWER_MULT: Record<Intensity, number> = { 1: 1.3, 2: 1.0, 3: 0.75 };

export function effectiveTime(baseTime: number, intensity: Intensity): number {
  return Math.round(baseTime * POWER_MULT[intensity]);
}

export function computeOrder(
  selections: Selections,
  pantry: Ingredient[],
  intensity: Intensity
): OrderItem[] {
  const items: OrderItem[] = [];

  for (const [ingId, prepId] of selections.entries()) {
    const ing = pantry.find(p => p.id === ingId);
    if (!ing) continue;
    const prep = ing.preparations.find(p => p.id === prepId) ?? ing.preparations[0];
    items.push({
      ing,
      prep,
      time: effectiveTime(prep.time, intensity),
      addAt: 0,
      maxTime: 0,
    });
  }

  if (!items.length) return [];

  items.sort((a, b) => b.time - a.time);
  const maxTime = items[0].time;

  return items.map((item, i) => ({
    ...item,
    addAt: i === 0 ? 0 : maxTime - item.time,
    maxTime,
  }));
}
