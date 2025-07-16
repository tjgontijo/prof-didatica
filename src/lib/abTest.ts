export type AbTestVariant = string;
export type AbEventType = 'view' | 'conversion';

export interface AbTest {
  name: string;
  slug: string;
  cookieName: string;
  variants: Record<AbTestVariant, {
    path: string;
  }>;
  split: Record<AbTestVariant, number>;
}

export const abTests: Record<string, AbTest> = {  
  missaoLiteraria: {
    name: 'Missão Literária',
    slug: 'missao-literaria',
    cookieName: 'ab-missao-literaria-variant',
    variants: {
      a: { path: '/missao-literaria/a' },
      b: { path: '/missao-literaria/b' }
    },
    split: {
      a: 50,
      b: 50
    }
  }
};
