const should = require('should'),
  nock = require('nock');

const ApexRestService = require('../../src/services/apexrest');

// Shared test data
const SAMPLE_SERVICE = new ApexRestService();
const MOCK_SESSION =  {
  id: 'https://testDomain.com/testId',
  instance_url: 'testInstanceUrl',
  access_token: 'testAccessTocken',
  apiVersion: 'testApiVersion'
};

describe('when calling ApexRestService.createApexRequest', function () {

  it('should return the right request options', function () {
    const apiRequestOptions = SAMPLE_SERVICE.createApexRequest(MOCK_SESSION, 'testResource');

    should.exist(apiRequestOptions);
    // URL is correct
    should.exist(apiRequestOptions.url);
    apiRequestOptions.url.should.eql('testInstanceUrl/services/apexrest/testResource');
    // Request is signed
    should.exist(apiRequestOptions.headers);
    should.exist(apiRequestOptions.headers.Authorization);
    apiRequestOptions.headers.Authorization.should.eql('Bearer testAccessTocken');
  });
});
