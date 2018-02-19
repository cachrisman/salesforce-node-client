const should = require('should'),
  nock = require('nock');

const DataService = require('../../src/services/data');

// Shared test data
const SAMPLE_SERVICE = new DataService({apiVersion: 'testApiVersion'});
const MOCK_SESSION =  {
  id: 'https://testDomain.com/testId',
  instance_url: 'testInstanceUrl',
  access_token: 'testAccessTocken',
  apiVersion: 'v41.0'
};


describe('when calling DataService.getLoggedUser', function () {

  it('should send the right request and receive the right response', function (done) {
    const mockResponse = {display_name: 'testUserName'};

    const server = nock('https://testDomain.com')
      .matchHeader('Authorization', 'Bearer testAccessTocken')
      .get('/testId')
      .reply(200, mockResponse);

	  SAMPLE_SERVICE.getLoggedUser(MOCK_SESSION, function(error, payload) {
      should.not.exist(error);
      const data = JSON.parse(payload);
      data.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling DataService.createDataRequest', function () {

  it('should return the right request options', function () {
    const apiRequestOptions = SAMPLE_SERVICE.createDataRequest(MOCK_SESSION, 'testResource');

    should.exist(apiRequestOptions);
    // URL is correct
    should.exist(apiRequestOptions.url);
    apiRequestOptions.url.should.eql('testInstanceUrl/services/data/v41.0/testResource');
    // Request is signed
    should.exist(apiRequestOptions.headers);
    should.exist(apiRequestOptions.headers.Authorization);
    apiRequestOptions.headers.Authorization.should.eql('Bearer testAccessTocken');
    // Content-Type is application/json
    should.exist(apiRequestOptions.headers['Content-Type']);
    apiRequestOptions.headers['Content-Type'].should.eql('application/json');
  });
});
