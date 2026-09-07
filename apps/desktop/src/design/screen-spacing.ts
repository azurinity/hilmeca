import type { ValueScales } from './screen-scaling';

export const spacing: ValueScales = {
  xxs: { sfa: 1, sfb: 1.5, sfc: 2, sfd: 3, sfe: 4 },
  xs: { sfa: 2, sfb: 3, sfc: 4, sfd: 6, sfe: 8 },
  sm: { sfa: 4, sfb: 6, sfc: 8, sfd: 12, sfe: 16 },
  md: { sfa: 6, sfb: 9, sfc: 12, sfd: 18, sfe: 24 },
  lg: { sfa: 8, sfb: 12, sfc: 16, sfd: 24, sfe: 32 },
  xl: { sfa: 12, sfb: 18, sfc: 24, sfd: 36, sfe: 48 },
  xxl: { sfa: 16, sfb: 24, sfc: 32, sfd: 48, sfe: 64 },
};

export type SpacingConfig = ValueScales;
