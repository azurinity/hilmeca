import type { ScaleFactors } from './screen-scaling';

// Named typography roles. Each holds 5 scale-tier variants (sfa–sfe).
// Deliberately NOT keyed by Breakpoint — which sf tier is active is resolved
// elsewhere (auto by window width, or manually pinned), not fixed here.
export const TYPOGRAPHY_TOKEN_KEYS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'small',
  'overhead',
  'lowerBody',
  'body',
  'upperBody',
  'subheader',
  'display',
  'header',
  'title',
] as const;
export type TypographyToken = (typeof TYPOGRAPHY_TOKEN_KEYS)[number];

export type TypographyScale = Record<TypographyToken, ScaleFactors>;

export const typography: TypographyScale = {
  h1: { sfa: 16, sfb: 22, sfc: 28, sfd: 40, sfe: 52 },
  h2: { sfa: 14, sfb: 18, sfc: 22, sfd: 30, sfe: 38 },
  h3: { sfa: 12, sfb: 15, sfc: 18, sfd: 22, sfe: 26 },
  h4: { sfa: 10.5, sfb: 12, sfc: 14, sfd: 18, sfe: 21 },
  h5: { sfa: 9, sfb: 10.5, sfc: 12, sfd: 14.5, sfe: 18 },
  h6: { sfa: 7, sfb: 8.5, sfc: 10, sfd: 12, sfe: 14 },

  small: { sfa: 7, sfb: 9, sfc: 11, sfd: 13.5, sfe: 17 },
  overhead: { sfa: 8, sfb: 10, sfc: 12, sfd: 15, sfe: 19 },
  lowerBody: { sfa: 10, sfb: 12, sfc: 14, sfd: 18, sfe: 22 },
  body: { sfa: 11, sfb: 13, sfc: 15, sfd: 20, sfe: 24 },
  upperBody: { sfa: 13, sfb: 15, sfc: 17, sfd: 21.5, sfe: 26 },
  subheader: { sfa: 14, sfb: 16, sfc: 18, sfd: 23, sfe: 28 },
  display: { sfa: 15, sfb: 17.5, sfc: 20, sfd: 26, sfe: 32 },
  header: { sfa: 18, sfb: 21, sfc: 24, sfd: 30, sfe: 36 },
  title: { sfa: 22, sfb: 25, sfc: 28, sfd: 35, sfe: 42 },
};

export type TypographyConfig = TypographyScale;
