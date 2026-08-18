export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,

  // Semantic spacing tokens
  subtitleToSection: 12, // Distancia estándar entre cada subtítulo y la sección subsiguiente
  titleToContent: 12,    // Alias compatible
  sectionGap: 24,        // Separación vertical entre secciones consecutivas
  screenPadding: 16,     // Margen horizontal de pantalla
  cardPadding: 16,       // Padding interno de tarjetas
  itemGap: 10,           // Espacio entre elementos en listas y cuadrículas
} as const;

export type SpacingKey = keyof typeof Spacing;
