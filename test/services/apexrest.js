var should = require('should'),
  _ = require('underscore'),
  nock = require('nock');

var ApexRestService = require('../../src/services/apexrest');

function getSampleService() {
  return new ApexRestService();
}

function getMockSession() {
  return {id: 'https://domain/testId', instance_url: 'testInstanceUrl', access_token: 'testAccessTocken', apiVersion: 'testApiVersion'};
}

describe('when calling ApexRestService.createApexRequest', function () {

  it('should return the right request options', function () {
    var service = getSampleService();
    var mockSession = getMockSession();

    var apiRequestOptions = service.createApexRequest(mockSession, 'testResource');

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
