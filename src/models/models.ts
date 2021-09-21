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
  segments: Segment[];
}

export interface Category {
  name: string;
  url: string;
}

export interface Segment {
  id: number;
  imageUrl: string;
  name: string;
}

export interface ClimbingRoute {
  segmentId: number;
  id: number;
  parentRouteId?: number;
  name: string;
  order: number;
  assurance: string;
  grading: string;
  author: string;
  year: number;
  length: number;
  holds: any[];
}
