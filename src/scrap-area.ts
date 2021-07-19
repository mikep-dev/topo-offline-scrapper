import {Area, Aspect} from './models';
import {areaFactory, getAreaDataRowSelector} from './utils';
import {mappers} from './utils/maps';

interface ClimbingRoute {
  name: string;
  order: number;
  assurance: string;
  grading: string;
  author: string;
  year: number;
  length: number;
  pathData: any;
}

interface Segment {
  name: string;
  imageUrl: string;
  routeIds: string[];
}

declare const TopoEditorFactory: () => {};

export function scrapArea(url: string) {
  const area: Area = areaFactory(url);
  cy.intercept({method: 'POST', url: '/topo/topoEditor/loadPaths'}).as('loadPaths');
  cy.visit(url);

  getPaths();

  getName(area);
  getDescription(area);
  getCords(area);
  getRockType(area);
  getAspect(area);
  getSteepness(area);
  getApproachTime(area);
  getKidFriendly(area);
  getVegetation(area);

  return [area, cy.wait(1)] as const;
}

function getPaths() {
  const segments: {[segmentId: string]: Segment} = {};
  const routes: {[routeId: string]: ClimbingRoute} = {};

  cy.exists('div.topoEditor').then(selector => {
    if (selector === -1) return;

    const spy = cy.spy(TopoEditorFactory);

    cy.get(selector).each($el => {
      const id = $el.attr('id')?.split('_')?.[1] ?? '';
      const name = $el.closest('.ui-accordion-content').prev().text();
      const imageUrl = '';
      const routeIds: string[] = [];
      $el.find('.pathLiBottom').each((_, path) => {
        routeIds.push(path.id?.split('_')?.[1] ?? '');
      });

      segments[id] = {name, imageUrl, routeIds};
    });

    cy.get(selector).then($el => {
      console.log(segments);
      // times($el.length, () = > cy.wait('@loadPaths').then(interception => console.log(interception.response?.body)));
    });
  });
}

function getName(area: Area) {
  cy.exists('div.title h1').then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.name = $el.text();
    });
  });
}

function getCords(area: Area) {
  cy.exists('span.dataSm').then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      const cords = $el.text().split(',').map(Number);

      area.cords = {
        lat: cords[0],
        long: cords[1],
      };
    });
  });
}

function getRockType(area: Area) {
  cy.exists(getAreaDataRowSelector('Rodzaj skały')).then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.rockType = mappers.mapRockType($el.text());
    });
  });
}

function getAspect(area: Area) {
  cy.exists('div.wallFacing img').then(selector => {
    if (selector === -1) return;

    cy.get(selector).each($el => {
      area.aspect.push($el.attr('alt') as Aspect);
    });
  });
}

function getSteepness(area: Area) {
  cy.exists(getAreaDataRowSelector('Dostępne formacje')).then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.steepness = $el.text().replace(/\s+/g, ' ').trim().split(' ').map(mappers.mapSteepness);
    });
  });
}

function getApproachTime(area: Area) {
  cy.exists(getAreaDataRowSelector('Czas dojścia')).then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.approachTime = Number($el.text().split(' ')[0]);
    });
  });
}

function getKidFriendly(area: Area) {
  cy.exists(getAreaDataRowSelector('Przyjazna dzieciom')).then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.kidFriendly = mappers.mapBoolean($el.text());
    });
  });
}

function getVegetation(area: Area) {
  cy.exists(getAreaDataRowSelector('Otoczenie')).then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.vegetation = mappers.mapVegetation($el.text());
    });
  });
}

function getDescription(area: Area) {
  cy.exists('span.desc').then(selector => {
    if (selector === -1) return;

    cy.get(selector).then($el => {
      area.description = $el.text();
    });
  });
}
