import {VISIT_TIMEOUT} from '../utils';

export function attachMainInterceptor(url: string) {
  cy.intercept('**/*', {middleware: true}, req => {
    req.responseTimeout = VISIT_TIMEOUT;

    const whiteList = [url, '/topo/default/jquery/js/jquery-1.9.1.js', '/topo/topoEditor/loadPaths'];
    if (!whiteList.some(pattern => req.url.includes(pattern))) req.reply({statusCode: 200});

    req.on('before:response', res => {
      res.headers['cache-control'] = 'no-store';
    });
  });
}
