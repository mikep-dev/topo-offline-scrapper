/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    safeGet(selector: string): Chainable<JQuery<HTMLElement> | null>;
  }
}
