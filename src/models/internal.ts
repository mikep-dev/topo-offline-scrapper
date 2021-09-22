import {Section} from '.';

export type SectionKeyset = Pick<Section, 'id' | 'imageUrl'>;
export type RawClimbingRoutesData = {
  [index: string]: any;
  data: {
    [index: string]: any;
    points: any[];
  }[];
};
