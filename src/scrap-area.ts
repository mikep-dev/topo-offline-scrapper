import {Area, Aspect, ClimbingRoute, LoadRouteArgs} from './models';
import {areaFactory, getAreaDataRowSelector} from './utils';
import {mappers} from './utils/maps';

export function scrapArea(url: string, loadRouteCalls: LoadRouteArgs[]) {
  const area: Area = areaFactory(url);

  attachMainInterceptor(url);

  cy.visit(url);

  getName(area);
  getDescription(area);
  getCords(area);
  getRockType(area);
  getAspect(area);
  getSteepness(area);
  getApproachTime(area);
  getKidFriendly(area);
  getVegetation(area);

  // scrapSegments(area, loadRouteCalls);

  return {area, chainable: cy.wait(0)} as const;
}

function attachMainInterceptor(url: string) {
  cy.intercept('**/*', {middleware: true}, req => {
    const whiteList = [url, '/topo/default/jquery/js/jquery-1.9.1.js', '/topo/topoEditor/loadPaths'];
    if (!whiteList.some(pattern => req.url.includes(pattern))) req.reply({statusCode: 200});

    req.on('before:response', res => {
      res.headers['cache-control'] = 'no-store';
    });
  });
}

function parseClimbingRoutes(responseBody: any): ClimbingRoute[] {
  const parsedBody = JSON.parse(responseBody);
  const parsedDom = new DOMParser().parseFromString(parsedBody.pathsListBottom, 'text/html');
  const processedHoldsData = cleanUpHoldsData(parsedBody.data);

  const routes = Array.from(parsedDom.body.querySelectorAll('tr.row')).map((el, order): ClimbingRoute => {
    const routeId = Number(el.id.split('_')?.[1]);
    const columns = Array.from(el.querySelectorAll('td'));
    const {points, parentRouteId} = processedHoldsData.find(holds => holds.routeId === routeId) ?? {};

    return {
      id: routeId,
      parentRouteId,
      order,
      name: columns[1].textContent?.trim() ?? '',
      assurance: columns[2].textContent?.trim() ?? '',
      grading: columns[3].textContent?.trim() ?? '',
      author: columns[5].textContent?.trim() ?? '',
      year: Number(columns[6].textContent?.trim()),
      length: Number(columns[7].textContent?.split(' ')?.[0]),
      points,
    };
  });

  return routes;
}

function cleanUpHoldsData(holdsData: any[]) {
  return holdsData.map(entry => {
    return {
      points: entry.points
        .sort((pointA: any, pointB: any) => pointA.order - pointB.order)
        .map((point: any) => ({
          x: point.x,
          y: point.y,
          kind: point.kindId,
          visible: point.visible,
        })),
      routeId: entry.pathId,
      parentRouteId: entry.parentPathId,
    };
  });
}

function scrapSegments(area: Area, loadRouteCalls: LoadRouteArgs[]) {
  cy.wait(0).then(() => {
    loadRouteCalls.forEach(({imageId, imageUrl, pathId}) => {
      cy.request({
        url: '/topo/topoEditor/loadPaths',
        method: 'POST',
        body: {imageId, pathId},
        form: true,
      }).then(res => {
        area.segments.push({
          imageUrl,
          routes: parseClimbingRoutes(res.body),
        });
      });
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
