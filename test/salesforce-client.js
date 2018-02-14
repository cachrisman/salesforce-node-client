const should = require('should');

const SalesforceClient = require('../src/salesforce-client');

describe('when building SalesforceClient', function () {
    it('should require configuration', function () {
      (function() {
        new SalesforceClient();
      }).should.throw('Missing configuration attribute for Salesforce client: domain');
    });

    it('should support v1 split configuration', function () {
      const v1Config = {
        auth: {
          domain: 'https://testDomain.com',
          callbackUrl: 'testCallbackUrl',
          consumerKey: 'testConsumerKey',
          consumerSecret: 'testConsumerSecret'
        },
        data: {
          apiVersion: 'testApiVersion'
        }
      };

      new SalesforceClient(v1Config);
    });

    it('should support v2 flat configuration', function () {
      const v2Config = {
        domain: 'https://testDomain.com',
        callbackUrl: 'testCallbackUrl',
        consumerKey: 'testConsumerKey',
        consumerSecret: 'testConsumerSecret',
        apiVersion: 'testApiVersion'
      };

      new SalesforceClient(v2Config);
    });

    it('should support v2 env configuration', function () {
      process.env.domain = 'https://testDomain.com';
      process.env.callbackUrl = 'testCallbackUrl';
      process.env.consumerKey = 'testConsumerKey';
      process.env.consumerSecret = 'testConsumerSecret';
      process.env.apiVersion = 'testApiVersion';

      new SalesforceClient();
    });


    // Test mandatory configuration attributes
    const configAttributeTests = [
      {missingAttribute: 'domain', config: {}},
      {missingAttribute: 'callbackUrl', config: {domain: 'd'}},
      {missingAttribute: 'consumerKey', config: {domain: 'd', callbackUrl: 'cu'}},
      {missingAttribute: 'consumerSecret', config: {domain: 'd', callbackUrl: 'cu', consumerKey: 'ck'}},
      {missingAttribute: 'apiVersion', config: {domain: 'd', callbackUrl: 'cu', consumerKey: 'ck', consumerSecret: 'cs'}},
    ]
    configAttributeTests.forEach(function(test) {
      it('should require '+ test.missingAttribute +' in configuration', function () {
        (function() {
          new SalesforceClient(test.config);
        }).should.throw('Missing configuration attribute for Salesforce client: '+ test.missingAttribute);
      });
    });
});
