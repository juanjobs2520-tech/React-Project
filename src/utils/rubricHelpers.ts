import { Criterion, Scale } from '../models/Evaluation';

export const sumWeights = (criteria: { weight: number }[]): number =>
  Math.round(criteria.reduce((s, c) => s + Number(c.weight), 0) * 100) / 100;

export const scalesForCriterion = (scales: Scale[], criterionId: string): Scale[] =>
  scales.filter((s) => s.criterion_id === criterionId).sort((a, b) => b.value - a.value);

export const criterionHasMinScales = (scales: Scale[], criterionId: string, min = 2): boolean =>
  scales.filter((s) => s.criterion_id === criterionId).length >= min;

export const scaleLevelClass = (index: number, total: number): string => {
  if (total <= 1) return 'edugest-scale-best';
  const ratio = index / (total - 1);
  if (ratio <= 0) return 'edugest-scale-best';
  if (ratio <= 0.33) return 'edugest-scale-good';
  if (ratio <= 0.66) return 'edugest-scale-mid';
  return 'edugest-scale-low';
};

export const computeCriterionScore = (scaleValue: number, weight: number): number =>
  Math.round(scaleValue * (weight / 100) * 100) / 100;
