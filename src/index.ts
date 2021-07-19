import {Area} from './models';
import {scrapArea} from './scrap-area';

type AreaItem = {name: string; url: string};
const areas: Area[] = [];

describe('scrapper', () => {
  describe.skip('scrap areas list', () => {
    const areasList: AreaItem[] = [];

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
      cy.writeFile('cypress/fixtures/areas-list.json', areasList);
    });

    function scrapPage() {
      cy.get('a.name').each($el => {
        areasList.push({
          name: $el.text(),
          url: encodeURI(`https://topo.portalgorski.pl${$el.attr('href')}`),
        });
      });

      cy.exists('span.current.page + span.page > a').then(selector => {
        if (selector === -1) return;

        cy.get(selector)
          .click()
          .then(() => {
            scrapPage();
          });
      });
    }
  });

  describe('scrap areas', () => {
    it('scrap areas', () => {
      cy.fixture('areas-list.json').then((list: AreaItem[]) => {
        scrapByIndex(list, 0, 1);
      });
    });

    after(() => {
      cy.writeFile('areas.json', areas);
    });

    function scrapByIndex(list: AreaItem[], index: number, maxCount = 0) {
      if (maxCount !== 0 && index + 1 > maxCount) return;
      if (index === list.length) return;

      const [area, chainable] = scrapArea(list[index].url);
      chainable.then(() => {
        scrapByIndex(list, index + 1, maxCount);
        areas.push(area);
      });
    }
  });
});
