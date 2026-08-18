export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,

  // Semantic spacing tokens
  titleToContent: 12, // Standard vertical distance between subtitle/section title and content
  sectionGap: 24,     // Vertical gap between consecutive sections
  screenPadding: 16,  // Screen edge horizontal padding
  cardPadding: 16,    // Internal container padding
  itemGap: 10,        // Gap between items in list / grid
} as const;

export type SpacingKey = keyof typeof Spacing;
