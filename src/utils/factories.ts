import {Area, Mapper, Dict, OTHER} from '../models';

export function areaFactory(url: string): Area {
  return {
    url,
    approachTime: -1,
    aspect: [],
    cords: {
      lat: -1,
      long: -1,
    },
    name: '',
    steepness: [],
    rockType: OTHER,
    kidFriendly: false,
    vegetation: OTHER,
    description: '',
    segments: [],
    categories: [],
  };
}

export function mapperFactory<T extends string>(map: Dict<T>): Mapper<T> {
  return value => map[value.trim()] ?? OTHER;
}
