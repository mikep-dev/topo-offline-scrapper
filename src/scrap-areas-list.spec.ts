import {BasicArea} from './models';

describe('scrap areas list', () => {
  const areasList: BasicArea[] = [];

  it('scrap areas list', () => {
    cy.visit('https://topo.portalgorski.pl/wyszukiwarka-skaly');

    cy.get('input[name="roadsFrom"]').type('0');
    cy.get('input[name="roadsTo"]').type('100');
    cy.get('#searchRock > form')
      .submit()
      .then(() => {
        scrapPage();
      });
  });

  after(() => {
    cy.writeFile('output/areas-list.json', areasList);
  });

  function scrapPage() {
    cy.get('a.name').each($el => {
      areasList.push({
        name: $el.text(),
        url: encodeURI(`https://topo.portalgorski.pl${$el.attr('href')}`),
      });
    });

    cy.exists('span.current.page + span.page > a').then(({exists, selector}) => {
      if (!exists) return;

      cy.get(selector)
        .click()
        .then(() => {
          scrapPage();
        });
    });
  }
});
