import {Dict, RockType, Steepness, Vegetation} from '../models';
import {mapperFactory} from './factories';

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
