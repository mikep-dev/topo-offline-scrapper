import {scrapers} from '.';
import {Area, Aspect, FetchSegmentCallArgs} from '../models';
import {areaFactory, mappers, REQUEST_TIMEOUT} from '../utils';
import {fetchClimbingRoutes, parseClimbingRoutes} from './fetch-climbing-holds';

export const getAreaDataRowSelector = (title: string) => `tr:has(div[title="${title}"]) > td:last-child > span`;

export function getName(area: Area) {
  cy.exists('div.title h1').then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.name = $el.text();
    });
  });
}

export function getCategories(area: Area) {
  cy.exists('div.obbreadcrumbs span:nth-child(n+3) a').then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).each($el => {
      area.categories.push({
        name: $el.text().trim(),
        url: $el.attr('href') ?? '',
      });
    });
  });
}

export function getCords(area: Area) {
  cy.exists('span.dataSm').then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      const cords = $el.text().split(',').map(Number);

      area.cords = {
        lat: cords[0],
        long: cords[1],
      };
    });
  });
}

export function getRockType(area: Area) {
  cy.exists(getAreaDataRowSelector('Rodzaj skały')).then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.rockType = mappers.mapRockType($el.text());
    });
  });
}

export function getAspect(area: Area) {
  cy.exists('div.wallFacing img').then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).each($el => {
      area.aspect.push($el.attr('alt') as Aspect);
    });
  });
}

export function getSteepness(area: Area) {
  cy.exists(getAreaDataRowSelector('Dostępne formacje')).then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.steepness = $el.text().replace(/\s+/g, ' ').trim().split(' ').map(mappers.mapSteepness);
    });
  });
}

export function getApproachTime(area: Area) {
  cy.exists(getAreaDataRowSelector('Czas dojścia')).then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.approachTime = Number($el.text().split(' ')[0]);
    });
  });
}

export function getKidFriendly(area: Area) {
  cy.exists(getAreaDataRowSelector('Przyjazna dzieciom')).then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.kidFriendly = mappers.mapBoolean($el.text());
    });
  });
}

export function getVegetation(area: Area) {
  cy.exists(getAreaDataRowSelector('Otoczenie')).then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.vegetation = mappers.mapVegetation($el.text());
    });
  });
}

export function getDescription(area: Area) {
  cy.exists('span.desc').then(({exists, selector}) => {
    if (!exists) return;

    cy.get(selector).then($el => {
      area.description = $el.text();
    });
  });
}

export function scrapSegments(area: Area, fetchSegmentCallsArgs: FetchSegmentCallArgs[]) {
  cy.wait(0).then(() => {
    area.segments = fetchSegmentCallsArgs.map(callArgs => ({
      id: callArgs.id,
      imageUrl: callArgs.imageUrl,
      name: '',
    }));
  });
}

export function scrapClimbingRoutes(fetchSegmentCallsArgs: FetchSegmentCallArgs[]) {
  return cy
    .wait(0)
    .then(() => cy.log(`Scraping ${fetchSegmentCallsArgs.length} climbing routes...`))
    .then({timeout: REQUEST_TIMEOUT}, () => fetchClimbingRoutes(fetchSegmentCallsArgs))
    .then(responses =>
      responses.map(({response, fetchSegmentCallArgs}) => {
        const routes = parseClimbingRoutes(response);

        return routes.map(route => ({...route, segmentId: fetchSegmentCallArgs.id}));
      }),
    );
}
