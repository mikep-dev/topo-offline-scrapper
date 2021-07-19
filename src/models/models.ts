export const OTHER = 'other' as const;
export type Other = typeof OTHER;

export type Aspect = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type RockType = 'sandstone' | 'agglomerate' | 'granite' | 'limestone' | Other;
export type Steepness = 'corner' | 'buttress' | 'chimney' | 'slab' | 'vertical' | 'overhang' | 'roof' | Other;
export type Vegetation = 'openField' | 'forest' | Other;

export interface Area {
  url: string;
  name: string;
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
}
