export class RetryService {
  lastAreaName = '';
  retryCount = 0;

  check(currentAreaName: string) {
    if (this.lastAreaName === currentAreaName) {
      this.retryCount++;
      cy.wait(this.retryCount * (Math.random() * 5 + 5) * 1000);
    } else {
      this.retryCount = 0;
    }

    this.lastAreaName = currentAreaName;
  }
}
