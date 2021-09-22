export const OTHER = 'other' as const;
export type Other = typeof OTHER;

export type Aspect = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type RockType = 'sandstone' | 'agglomerate' | 'granite' | 'limestone' | Other;
export type Steepness = 'corner' | 'buttress' | 'chimney' | 'slab' | 'vertical' | 'overhang' | 'roof' | Other;
export type Vegetation = 'openField' | 'forest' | Other;

export interface BasicArea {
  url: string;
  name: string;
}

export interface Area extends BasicArea {
  categories: Category[];
  cords: {
    lat: number;
    long: number;
  };
  rockType: RockType;
  aspect: Aspect[];
  steepness: Steepness[];
  /**
   * In minutes.
   */
  approachTime: number;
  kidFriendly: boolean;
  vegetation: Vegetation;
  description: string;
  imageUrl: string;
  sections: Section[];
}

export interface Category {
  name: string;
  url: string;
}

export interface Section {
  id: number;
  imageUrl: string;
  name: string;
}

export interface ClimbingRoute {
  sectionId: number;
  id: number;
  parentRouteId?: number;
  name: string;
  assurance: string;
  grading: string;
  author: string;
  year: number;
  length: number;
}

export interface ClimbingHold {
  x: number;
  y: number;
  order: number;
  kindId: number;
  kindName: string;
  typeId: number;
  visible: boolean;
  limiter?: string;
  routeId: number;
  sectionId: number;
}
