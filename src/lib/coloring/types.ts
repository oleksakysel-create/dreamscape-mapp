export const COLORING_CATEGORIES = [
  "mandala",
  "nature",
  "ocean",
  "geometric",
  "botanical",
  "cosmos",
] as const;
export type ColoringCategory = (typeof COLORING_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ColoringCategory, string> = {
  mandala: "Mandala",
  nature: "Landscapes",
  ocean: "Ocean",
  geometric: "Geometric",
  botanical: "Botanical",
  cosmos: "Cosmos",
};

export interface Region {
  id: string;
  d: string;
  /** Region contains holes (child regions) and must be painted with evenodd. */
  evenOdd?: boolean;
}

export interface Illustration {
  viewBox: string;
  regions: Region[];
}

export interface ColoringImageMeta {
  id: string;
  title: string;
  category: ColoringCategory;
  description: string;
  difficulty: "gentle" | "flowing" | "intricate";
}

export type Fills = Record<string, string>;
