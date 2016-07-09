var should = require('should'),
  _ = require('underscore'),
  nock = require('nock');

var DataService = require('../../src/services/data');

function getSampleService() {
  return new DataService({apiVersion: 'testApiVersion'});
}

function getMockSession() {
  return {id: 'https://domain/testId', instance_url: 'testInstanceUrl', access_token: 'testAccessTocken', apiVersion: 'testApiVersion'};
}


describe('when building DataService', function () {

  // Test mandatory configuration
  it('should require configuration', function () {
    (function() {
      new DataService();
    }).should.throw('Missing configuration for Salesforce Data service');
  });

  // Test mandatory configuration attributes
  it('should require apiVersion in configuration', function () {
    (function() {
      new DataService({});
    }).should.throw('Missing configuration for Salesforce Data service: apiVersion');
  });
});


describe('when calling DataService.getLoggedUser', function () {

  it('should send the right request and receive the right response', function (done) {
    var service = getSampleService();
    var mockSession = getMockSession();
    var mockResponse = {display_name: 'testUserName'};

    var server = nock('https://domain')
      .matchHeader('Authorization', 'Bearer testAccessTocken')
      .get('/testId')
      .reply(200, mockResponse);

    service.getLoggedUser(mockSession, function(error, payload) {
      should.not.exist(error);
      var data = JSON.parse(payload);
      data.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling DataService.createDataRequest', function () {

  it('should return the right request options', function () {
    var service = getSampleService();
    var mockSession = getMockSession();

    var apiRequestOptions = service.createDataRequest(mockSession, 'testResource');

    should.exist(apiRequestOptions);
    // URL is correct
    should.exist(apiRequestOptions.url);
    apiRequestOptions.url.should.eql('testInstanceUrl/services/data/testApiVersion/testResource');
    // Request is signed
    should.exist(apiRequestOptions.headers);
    should.exist(apiRequestOptions.headers.Authorization);
    apiRequestOptions.headers.Authorization.should.eql('Bearer testAccessTocken');
  });
});
