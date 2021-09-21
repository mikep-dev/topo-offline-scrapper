/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    exists(selector: string): Chainable<{exists: boolean; selector: string}>;
  }
}
