import {ClimbingHold, ClimbingRoute, RawClimbingRoutesData, SectionKeyset as SectionKeyset} from '../models';

export async function fetchClimbingRoutesAndHolds(sectionKeysets: SectionKeyset[]) {
  const sections = await Promise.all(sectionKeysets.map(sectionKeyset => fetchSection(sectionKeyset)));

  return {
    climbingRoutes: sections.flatMap(section => section.climbingRoutes),
    climbingHolds: sections.flatMap(section => section.climbingHolds),
  };
}

export async function fetchSection(
  sectionKeyset: SectionKeyset,
  tries = 1,
  delay = 1000,
): Promise<{climbingRoutes: ClimbingRoute[]; climbingHolds: ClimbingHold[]}> {
  const body = new FormData();
  body.append('imageId', String(sectionKeyset.id));
  body.append('imageUrl', sectionKeyset.imageUrl);
  body.append('pathId', '0');

  const response = await fetch('https://topo.portalgorski.pl/topo/topoEditor/loadPaths', {method: 'POST', body});
  if (!response.ok) {
    if (tries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchSection(sectionKeyset, tries - 1);
    }

    throw response;
  }

  const responseBody = (await response.json()) as RawClimbingRoutesData;

  return {
    climbingRoutes: parseClimbingRoutes(responseBody, sectionKeyset.id),
    climbingHolds: parseClimbingHolds(responseBody),
  };
}

function parseClimbingRoutes(data: RawClimbingRoutesData, sectionId: number): ClimbingRoute[] {
  const parsedDom = new DOMParser().parseFromString(data.pathsListBottom, 'text/html');

  return Array.from(parsedDom.body.querySelectorAll('tr.row')).map(el => {
    const routeId = Number(el.id.split('_')?.[1]);
    const columns = Array.from(el.querySelectorAll('td'));

    return {
      id: routeId,
      sectionId,
      parentRouteId: data.data.find(routeEntry => routeEntry?.pathId === routeId)?.parentPathId,
      name: columns[1].textContent?.trim() ?? '',
      assurance: columns[2].textContent?.trim() ?? '',
      grading: columns[3].textContent?.trim() ?? '',
      author: columns[5].textContent?.trim() ?? '',
      year: Number(columns[6].textContent?.trim()),
      length: Number(columns[7].textContent?.trim().split(' ')?.[0]),
    };
  });
}

type LimiterWithHoldId = {holdId: number; limiter: string};
function parseLimiters(data: RawClimbingRoutesData): LimiterWithHoldId[] {
  const parsedDom = new DOMParser().parseFromString(data.pointsTooltips, 'text/html');
  const tooltips = Array.from(parsedDom.body.querySelectorAll('.pointTooltip'));

  return tooltips.reduce<LimiterWithHoldId[]>((acc, cur) => {
    if (cur.querySelector('.title')?.textContent !== 'ogranicznik') return acc;

    acc.push({
      holdId: Number(cur.id?.split('_')?.[1]) || -1,
      limiter: cur.querySelector('.description')?.textContent ?? '',
    });

    return acc;
  }, []);
}

function parseClimbingHolds(data: RawClimbingRoutesData): ClimbingHold[] {
  const limiters = parseLimiters(data);

  return data.data.flatMap(route =>
    route.points
      .sort((pointA, pointB) => pointA.order - pointB.order)
      .map(
        (point): ClimbingHold => ({
          x: point.x,
          y: point.y,
          order: point.order,
          kindId: point.kindId,
          kindName: point.kindName,
          typeId: point.typeId,
          visible: point.visible,
          routeId: point.pathId,
          sectionId: route.imageId,
          limiter: limiters.find(limiter => limiter.holdId === point.pointId)?.limiter,
        }),
      ),
  );
}
