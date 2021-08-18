import {Area, BasicArea, LoadRouteArgs} from './models';
import {scrapArea} from './scrap-area';

describe('scrap areas', () => {
  const areas: Area[] = [];
  let loadRouteCalls: LoadRouteArgs[];

  beforeEach(() => {
    loadRouteCalls = [];

    cy.on('window:before:load', win => {
      Object.defineProperty(win, 'TopoEditorFactory', {value: createTopoEditorFactoryMock(loadRouteCalls)});
    });
  });

  (require('../cypress/fixtures/areas-list') as BasicArea[]).forEach(({name, url}) => {
    it(`scrap area ${name}`, () => {
      const data = scrapArea(url, loadRouteCalls);
      data.chainable.then(() => areas.push(data.area));
    });
  });

  afterEach(() => {
    cy.writeFile('areas.json', areas);
  });
});

function createTopoEditorFactoryMock(loadRouteCalls: LoadRouteArgs[]) {
  return (config: {id: number; imageMain: string; loadPathId?: number}) => {
    loadRouteCalls.push({
      imageId: config.id,
      pathId: config.loadPathId ?? 0,
      imageUrl: config.imageMain,
    });
  };
}
