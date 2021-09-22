import {Aspect, SectionKeyset} from '../models';
import {mappers, REQUEST_TIMEOUT} from '../utils';
import {fetchClimbingRoutesAndHolds} from './fetch-climbing-holds';

export const getAreaDataRowSelector = (title: string) => `tr:has(div[title="${title}"]) > td:last-child > span`;

export function unsafeGetName() {
  return cy.get('div.title h1').then($el => $el && $el.text());
}

export function getCategories() {
  return cy.safeGet('div.obbreadcrumbs span:nth-child(n+3) a').then(
    $els =>
      $els &&
      $els.toArray().map(el => ({
        name: Cypress.$(el).text().trim(),
        url: Cypress.$(el).attr('href') ?? '',
      })),
  );
}

export function getCords() {
  return cy.safeGet('span.dataSm').then(
    $el =>
      $el && {
        lat: $el.text().split(',').map(Number)[0],
        long: $el.text().split(',').map(Number)[1],
      },
  );
}

export function getRockType() {
  return cy.safeGet(getAreaDataRowSelector('Rodzaj skały')).then($el => $el && mappers.mapRockType($el.text()));
}

export function getAspect() {
  return cy
    .safeGet('div.wallFacing img')
    .then($els => $els && $els.toArray().map(el => Cypress.$(el).attr('alt') as Aspect));
}

export function getSteepness() {
  return cy
    .safeGet(getAreaDataRowSelector('Dostępne formacje'))
    .then($el => $el && $el.text().replace(/\s+/g, ' ').trim().split(' ').map(mappers.mapSteepness));
}

export function getApproachTime() {
  return cy.safeGet(getAreaDataRowSelector('Czas dojścia')).then($el => $el && Number($el.text().split(' ')[0]));
}

export function getKidFriendly() {
  return cy.safeGet(getAreaDataRowSelector('Przyjazna dzieciom')).then($el => $el && mappers.mapBoolean($el.text()));
}

export function getVegetation() {
  return cy.safeGet(getAreaDataRowSelector('Otoczenie')).then($el => $el && mappers.mapVegetation($el.text()));
}

export function getDescription() {
  return cy.safeGet('span.desc').then($el => $el && $el.text());
}

export function getImageUrl() {
  return cy.safeGet('img#main-image').then($el => $el && $el.attr('src'));
}

export function scrapSegments(sectionKeysets: SectionKeyset[]) {
  return cy.wait(0).then(() =>
    sectionKeysets.map(callArgs => ({
      id: callArgs.id,
      imageUrl: callArgs.imageUrl,
      name: cy.$$(`div#topoEditor_${callArgs.id}`).closest('h5~div').prev().text(),
    })),
  );
}

export function scrapClimbingRoutesAndHolds(sectionKeysets: SectionKeyset[]) {
  return cy
    .wait(0)
    .then(() => cy.log(`Scraping ${sectionKeysets.length} climbing routes...`))
    .then({timeout: REQUEST_TIMEOUT}, () => fetchClimbingRoutesAndHolds(sectionKeysets));
}
