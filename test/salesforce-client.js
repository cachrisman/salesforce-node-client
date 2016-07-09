var should = require('should');

var SalesforceClient = require('../src/salesforce-client');

describe('when building SalesforceClient', function () {
    it('should require configuration', function () {
      (function() {
        new SalesforceClient();
      }).should.throw('Missing configuration for Salesforce client');
    });
});
