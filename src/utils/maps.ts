import {Dict, Mapper, OTHER, RockType, Steepness, Vegetation} from '../models';

function mapperFactory<T extends string>(map: Dict<T>): Mapper<T> {
  return value => map[value.trim()] ?? OTHER;
}

const rockTypeMap: Dict<RockType> = {
  zlepieniec: 'agglomerate',
  piaskowiec: 'sandstone',
  granit: 'granite',
  wapień: 'limestone',
};

const steepnsessMap: Dict<Steepness> = {
  filar: 'buttress',
  komin: 'chimney',
  pion: 'vertical',
  połóg: 'slab',
  przewieszenie: 'overhang',
  zacięcie: 'corner',
  sufit: 'roof',
};

const vegetationMap: Dict<Vegetation> = {
  'Otwarta przestrzeń': 'openField',
  Las: 'forest',
};

export const mappers = {
  mapRockType: mapperFactory(rockTypeMap),
  mapSteepness: mapperFactory(steepnsessMap),
  mapVegetation: mapperFactory(vegetationMap),
  mapBoolean: (value: string) => value.trim() === 'TAK',
};
