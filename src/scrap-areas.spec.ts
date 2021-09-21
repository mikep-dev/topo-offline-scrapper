import {Area, BasicArea, ClimbingRoute, FetchSegmentCallArgs} from './models';
import {areaFactory, filenamePrefixes, VISIT_TIMEOUT} from './utils';
import {attachMainInterceptor} from './modules/interceptors';
import {scrapers} from './modules';

const sliceStart = Cypress.env('sliceStart') ?? 0;
const sliceEnd = Cypress.env('sliceEnd') ?? 2;

describe('scrap areas', () => {
  let fetchSegmentCallsArgs: FetchSegmentCallArgs[];

  const areas: Area[] = [];
  const climbingRoutes: ClimbingRoute[] = [];

  beforeEach(() => {
    fetchSegmentCallsArgs = [];

    cy.on('window:before:load', win => {
      Object.defineProperty(win, 'TopoEditorFactory', {
        value: (args: {id: number; imageMain: string}) => {
          fetchSegmentCallsArgs.push({id: args.id, imageUrl: args.imageMain});
        },
      });
    });
  });

  (require('../cypress/fixtures/areas-list') as BasicArea[]).slice(sliceStart, sliceEnd).forEach(({name, url}) => {
    it(`scrap area ${name}`, () => {
      const area: Area = areaFactory(url);

      // attachMainInterceptor(url);
      cy.visit(url, {timeout: VISIT_TIMEOUT, responseTimeout: VISIT_TIMEOUT} as any);

      scrapers.getName(area);
      scrapers.getCategories(area);
      scrapers.getDescription(area);
      scrapers.getCords(area);
      scrapers.getRockType(area);
      scrapers.getAspect(area);
      scrapers.getSteepness(area);
      scrapers.getApproachTime(area);
      scrapers.getKidFriendly(area);
      scrapers.getVegetation(area);
      scrapers.scrapSegments(area, fetchSegmentCallsArgs);
      scrapers.scrapClimbingRoutes(fetchSegmentCallsArgs).as('climbingRoutes');

      cy.get('@climbingRoutes').each((route: ClimbingRoute) => climbingRoutes.push(route));
      cy.wait(0).then(() => areas.push(area));
    });
  });

  afterEach(() => {
    const suffix = `_${sliceStart}-${sliceEnd}`;

    cy.writeFile(`output/${filenamePrefixes.AREAS}${suffix}.json`, areas);
    cy.writeFile(`output/${filenamePrefixes.CLIMBING_ROUTES}${suffix}.json`, climbingRoutes);
  });
});
