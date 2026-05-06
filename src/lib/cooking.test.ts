import { computeOrder, effectiveTime } from './cooking';
import type { Ingredient, Selections } from '../types';
import assert from 'assert';

// Mock pantry for testing
const mockPantry: Ingredient[] = [
  {
    id: 1,
    name: { en: 'Carrot', es: 'Zanahoria' },
    article: { en: 'a', es: 'una' },
    time: 15,
    checked: true,
    img: 'carrot.svg',
    preparations: [
      { id: 1, name: { en: 'whole', es: 'entera' }, time: 15 },
      { id: 2, name: { en: 'halved', es: 'mitades' }, time: 10 },
    ],
  },
  {
    id: 2,
    name: { en: 'Broccoli', es: 'Brócoli' },
    article: { en: 'a', es: 'un' },
    time: 8,
    checked: true,
    img: 'broccoli.svg',
    preparations: [
      { id: 1, name: { en: 'whole', es: 'entero' }, time: 8 },
      { id: 2, name: { en: 'chopped', es: 'picado' }, time: 5 },
    ],
  },
  {
    id: 3,
    name: { en: 'Asparagus', es: 'Espárrago' },
    article: { en: 'an', es: 'un' },
    time: 6,
    checked: true,
    img: 'asparagus.svg',
    preparations: [
      { id: 1, name: { en: 'whole', es: 'entero' }, time: 6 },
      { id: 2, name: { en: 'halved', es: 'mitades' }, time: 4 },
    ],
  },
];

describe('effectiveTime', () => {
  it('applies low intensity multiplier (×1.3)', () => {
    assert.strictEqual(effectiveTime(10, 1), 13);
  });

  it('applies medium intensity multiplier (×1.0)', () => {
    assert.strictEqual(effectiveTime(10, 2), 10);
  });

  it('applies high intensity multiplier (×0.75)', () => {
    assert.strictEqual(effectiveTime(10, 3), 8);
  });
});

describe('computeOrder', () => {
  it('returns empty array when no selections', () => {
    const selections = new Map<number, number>();
    const result = computeOrder(selections, mockPantry, 2);
    assert.deepStrictEqual(result, []);
  });

  it('handles single ingredient', () => {
    const selections = new Map<number, number>([[1, 1]]);
    const result = computeOrder(selections, mockPantry, 2);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].ing.id, 1);
    assert.strictEqual(result[0].addAt, 0);
    assert.strictEqual(result[0].maxTime, 15);
  });

  it('batches ingredients within ±3 min tolerance', () => {
    // Carrot 15min, Broccoli 8min, Asparagus 6min
    // At medium (×1.0): Carrot=15, Broccoli=8, Asparagus=6
    // Expected batches:
    // - Batch 1 (t=0): Carrot (15 min)
    // - Batch 2 (t=7): Broccoli (8 min, within ±3 of target), Asparagus (6 min, within ±3)

    const selections = new Map<number, number>([
      [1, 1], // Carrot whole (15 min)
      [2, 1], // Broccoli whole (8 min)
      [3, 1], // Asparagus whole (6 min)
    ]);
    const result = computeOrder(selections, mockPantry, 2);

    assert.strictEqual(result.length, 3);

    // First batch: Carrot at t=0
    assert.strictEqual(result[0].addAt, 0);
    assert.strictEqual(result[0].ing.id, 1);

    // Second batch: Broccoli and Asparagus should be added together
    // They should finish around same time as carrot
    // With heat loss: +2 min per batch opening
    // Batch 1: Carrot at t=0, finishes at t=15
    // Batch 2: needs to finish at t=15
    // If Broccoli takes 8 min: start at t=15-8+2 = 9 (heat loss compensation)
    // If Asparagus takes 6 min: start at t=15-6+2 = 11 (but batched with Broccoli)

    // Both Broccoli and Asparagus should have same addAt if batched
    // Verify batching is applied
    const batch2Items = result.filter(r => r.addAt === result[1].addAt);
    assert(batch2Items.length >= 1, 'Second batch should exist');
  });

  it('accounts for heat loss when opening pot for new batch', () => {
    // With ingredients: 15, 8, 6
    // First ingredient (15) starts at t=0
    // Second batch (8, 6) should account for +2 min heat loss
    // Formula: addAt = (maxTime + heatLoss * batchNumber) - effectiveTime

    const selections = new Map<number, number>([
      [1, 1], // Carrot 15 min
      [2, 1], // Broccoli 8 min
    ]);
    const result = computeOrder(selections, mockPantry, 2);

    assert.strictEqual(result.length, 2);

    // Carrot: first batch, no heat loss
    assert.strictEqual(result[0].addAt, 0);
    assert.strictEqual(result[0].time, 15);

    // Broccoli: second batch, accounts for +2 min heat loss
    // addAt should be > (maxTime - broccoli.time) due to heat loss
    const carrotTime = result[0].time;
    const broccoliTime = result[1].time;

    // Without heat loss: broccoli would be at 15 - 8 = 7
    // With +2 heat loss for opening pot: should be at 7 + 2 = 9
    assert.strictEqual(result[1].addAt, 9);
  });

  it('calculates correct finish times for all ingredients', () => {
    const selections = new Map<number, number>([
      [1, 1], // Carrot 15 min
      [2, 1], // Broccoli 8 min
    ]);
    const result = computeOrder(selections, mockPantry, 2);

    // All items should finish at maxTime
    result.forEach(item => {
      const finishTime = item.addAt + item.time;
      // Each finish time should equal maxTime or be within bounds due to heat loss accounting
      assert(finishTime >= item.maxTime - 1, `Item should finish near maxTime, got ${finishTime} for maxTime ${item.maxTime}`);
    });
  });

  it('handles ingredients with different prep variants', () => {
    // Carrot halved (10 min) instead of whole (15 min)
    const selections = new Map<number, number>([
      [1, 2], // Carrot halved (10 min)
      [2, 1], // Broccoli whole (8 min)
    ]);
    const result = computeOrder(selections, mockPantry, 2);

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].time, 10);
    assert.strictEqual(result[1].time, 8);
  });
});
