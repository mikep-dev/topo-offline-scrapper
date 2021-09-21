import {ClimbingRoute, FetchSegmentCallArgs} from '../models';

export function fetchClimbingRoutes(fetchSegmentCallsArgs: FetchSegmentCallArgs[]) {
  const loadClimbingRoutePromises = fetchSegmentCallsArgs.map(
    fetchSegmentCallArgs =>
      new Promise<{response: any; fetchSegmentCallArgs: FetchSegmentCallArgs}>((resolve, reject) => {
        fetchClimbingRoute(fetchSegmentCallArgs)
          .then(response => resolve({response, fetchSegmentCallArgs}))
          .catch(reject);
      }),
  );

  return Promise.all(loadClimbingRoutePromises);
}

export function parseClimbingRoutes(responseBody: any): ClimbingRoute[] {
  const parsedDom = new DOMParser().parseFromString(responseBody.pathsListBottom, 'text/html');
  const processedHoldsData = cleanUpHoldsData(responseBody.data);

  return Array.from(parsedDom.body.querySelectorAll('tr.row')).map((el, order): ClimbingRoute => {
    const routeId = Number(el.id.split('_')?.[1]);
    const columns = Array.from(el.querySelectorAll('td'));
    const {holds, parentRouteId} = processedHoldsData.find(holds => holds.routeId === routeId) ?? {};

    return {
      segmentId: -1,
      id: routeId,
      parentRouteId,
      order,
      name: columns[1].textContent?.trim() ?? '',
      assurance: columns[2].textContent?.trim() ?? '',
      grading: columns[3].textContent?.trim() ?? '',
      author: columns[5].textContent?.trim() ?? '',
      year: Number(columns[6].textContent?.trim()),
      length: Number(columns[7].textContent?.trim().split(' ')?.[0]),
      holds,
    };
  });
}

function cleanUpHoldsData(holdsData: any[]) {
  return holdsData.map(entry => ({
    holds: entry.points
      .sort((pointA: any, pointB: any) => pointA.order - pointB.order)
      .map((point: any) => ({
        x: point.x,
        y: point.y,
        order: point.order,
        kind: point.kindId,
        kindName: point.kindName,
        typeId: point.typeId,
        visible: point.visible,
      })),
    routeId: entry.pathId,
    parentRouteId: entry.parentPathId,
  }));
}

// function scrapSegments(area: Area, loadRouteCalls: LoadRouteArgs[]) {
//   const rawHoldsData: any[] = [];

//   cy.wait(0).then(() => {
//     loadRouteCalls.forEach(({imageId, imageUrl, pathId}) => {
//       cy.request({
//         url: '/topo/topoEditor/loadPaths',
//         method: 'POST',
//         body: {imageId, pathId},
//         form: true,
//         timeout: 120000,
//       }).then(res => {
//         const parsingResult = parseClimbingRoutes(res.body);

//         area.segments.push({
//           imageUrl,
//           routes: parsingResult.routes,
//         });

//         rawHoldsData.push(parsingResult.rawHoldsData);
//       });
//     });
//   });

//   return rawHoldsData;
// }

async function fetchClimbingRoute(loadRouteArgs: FetchSegmentCallArgs) {
  const body = new FormData();
  body.append('imageId', String(loadRouteArgs.id));
  body.append('imageUrl', loadRouteArgs.imageUrl);
  body.append('pathId', '0');

  const response = fetch('https://topo.portalgorski.pl/topo/topoEditor/loadPaths', {method: 'POST', body});

  return (await response).json();
}
