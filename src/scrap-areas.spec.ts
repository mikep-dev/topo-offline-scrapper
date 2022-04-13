import {Area, BasicArea, ClimbingRoute, SectionKeyset, OTHER, ClimbingHold} from './models';
import {filenamePrefixes, OUTPUT_DIR, RetryService, SLICE_END, SLICE_START, VISIT_TIMEOUT} from './utils';
import {attachMainInterceptor} from './modules/interceptors';
import {scrapers} from './modules';
import * as path from 'path';

const sliceStart = Cypress.env(SLICE_START) ?? 0;
const sliceEnd = Cypress.env(SLICE_END) ?? 5;

describe('scrap areas', () => {
  let sectionKeysets: SectionKeyset[];

  const areas: Area[] = [];
  const climbingRoutes: ClimbingRoute[] = [];
  const climbingHolds: ClimbingHold[] = [];

  const retryService = new RetryService();

  beforeEach(() => {
    sectionKeysets = [];

    cy.on('window:before:load', win => {
      Object.defineProperty(win, 'TopoEditorFactory', {
        value: (args: {id: number; imageMain: string}) => {
          sectionKeysets.push({id: args.id, imageUrl: args.imageMain});
        },
      });
    });
  });

  (require('../cypress/fixtures/areas-list') as BasicArea[]).slice(sliceStart, sliceEnd).forEach(({name, url}) => {
    it(`scrap area ${name}`, function () {
      retryService.check(name);

      attachMainInterceptor(url);
      cy.visit(url, {timeout: VISIT_TIMEOUT, responseTimeout: VISIT_TIMEOUT} as any);

      cy.wrap(url).as('url');
      scrapers.unsafeGetName().as('name');
      scrapers.getCategories().as('categories');
      scrapers.getDescription().as('description');
      scrapers.getCords().as('cords');
      scrapers.getRockType().as('rockType');
      scrapers.getAspect().as('aspect');
      scrapers.getSteepness().as('steepness');
      scrapers.getApproachTime().as('approachTime');
      scrapers.getKidFriendly().as('kidFriendly');
      scrapers.getVegetation().as('vegetation');
      scrapers.getImageUrl().as('imageUrl');
      scrapers.scrapSegments(sectionKeysets).as('segments');
      scrapers.scrapClimbingRoutesAndHolds(sectionKeysets).then(({climbingRoutes, climbingHolds}) => {
        cy.wrap(climbingRoutes).as('climbingRoutes');
        cy.wrap(climbingHolds).as('climbingHolds');
      });

      cy.get('@climbingRoutes').each((route: ClimbingRoute) => climbingRoutes.push(route));
      cy.get('@climbingHolds').each((hold: ClimbingHold) => climbingHolds.push(hold));
      cy.wait(0).then(() => areas.push(createArea(this)));
    });
  });

  afterEach(() => {
    const suffix = `_${sliceStart}-${sliceEnd}`;

    cy.writeFile(path.join(OUTPUT_DIR, `${filenamePrefixes.AREAS}${suffix}.json`), areas);
    cy.writeFile(path.join(OUTPUT_DIR, `${filenamePrefixes.CLIMBING_ROUTES}${suffix}.json`), climbingRoutes);
    cy.writeFile(path.join(OUTPUT_DIR, `${filenamePrefixes.CLIMBING_HOLDS}${suffix}.json`), climbingHolds);
  });
});

const createArea = (context: any): Area => ({
  url: context.url ?? '',
  approachTime: context.approachTime ?? -1,
  aspect: context.aspect ?? [],
  cords: context.cords ?? {
    lat: -1,
    long: -1,
  },
  name: context.name ?? '',
  steepness: context.steepness ?? [],
  rockType: context.rockType ?? OTHER,
  kidFriendly: context.kidFriendly ?? false,
  vegetation: context.vegetation ?? OTHER,
  description: context.description ?? '',
  sections: context.segments ?? [],
  categories: context.categories ?? [],
  imageUrl: context.imageUrl ?? '',
});
