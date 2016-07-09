var should = require('should'),
  _ = require('underscore'),
  nock = require('nock'),
  crypto = require('crypto');

var OAuth2Service = require('../../src/services/oauth2');


function getSampleService() {
  return new OAuth2Service({
    domain: 'https://testDomain.com',
    callbackUrl: 'testCallbackUrl',
    consumerKey: 'testConsumerKey',
    consumerSecret: 'testConsumerSecret'
  });
}


describe('when building OAuth2Service', function () {

  // Test mandatory configuration
  it('should require configuration', function () {
    (function() {
      new OAuth2Service();
    }).should.throw('Missing configuration for Salesforce OAuth2 service');
  });

  // Test mandatory configuration attributes
  var configAttributeTests = [
    {attribute: 'domain', config: {}},
    {attribute: 'callbackUrl', config: {domain: 'd'}},
    {attribute: 'consumerKey', config: {domain: 'd', callbackUrl: 'ca'}},
    {attribute: 'consumerSecret', config: {domain: 'd', callbackUrl: 'ca', consumerKey: 'co'}},
  ]
  configAttributeTests.forEach(function(test) {
    it('should require '+ test.attribute +' in configuration', function () {
      (function() {
        new OAuth2Service(test.config);
      }).should.throw('Missing configuration for Salesforce OAuth2 service: '+ test.attribute);
    });
  });
});


describe('when calling OAuth2Service.getAuthorizationUrl', function () {

  it('should return the correct URL', function () {
    var service = getSampleService();
    var options = {scope: 'api'};
    var expectedUrl = 'https://testDomain.com/services/oauth2/authorize?client_id=testConsumerKey&redirect_uri=testCallbackUrl&response_type=code&scope=api';

    var actualUrl = service.getAuthorizationUrl(options);

    actualUrl.should.eql(expectedUrl);
  });
});


describe('when calling OAuth2Service.authenticate', function () {

  var service = getSampleService();
  var expectedUrl = '/services/oauth2/token?client_id=testConsumerKey&client_secret=testConsumerSecret&redirect_uri=testCallbackUrl&grant_type=authorization_code&code=testCode';

  it('should throw error if authorization code is not set', function () {
    (function() {
      service.authenticate({});
    }).should.throw('Missing authorization code');
  });

  it('should return error if response signature is missing', function (done) {
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    var expectedError = {
      message: 'Missing payload signature.',
      statusCode: 500,
      response: '{}'
    };

    service.authenticate({code: 'testCode'}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should return error if response signature is invalid', function (done) {
    var mockResponse = {signature: 'invalidSignature', id: 'https://testDomain.com', issued_at:'1332093834282'};
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    var expectedError = {
      message: 'The signature could not be verified.',
      statusCode: 500,
      response: JSON.stringify(mockResponse)
    };

    service.authenticate({code: 'testCode'}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should send the right request and receive the right response', function (done) {
    var mockResponse = {
        id: 'https://testDomain.com',
        issued_at: '1332093834282',
        scope: 'api',
        instance_url: 'https://na14.salesforce.com',
        access_token: '00Dd0000000dsWL!AR8AQCKKVxOwRhqhwXqNthdufggKWdUOOrp866CrJeEqF41eYP1kxtYmLMGxTkfRjFbzsD.Aqh8wvDyKyOPAVrDuyJS_bh2.'
    };
    var hmac = crypto.createHmac('sha256', 'testConsumerSecret');
    hmac.update(mockResponse.id);
    hmac.update(mockResponse.issued_at);
    mockResponse.signature = hmac.digest('base64');

    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    service.authenticate({code: 'testCode'}, function(error, payload) {
      should.not.exist(error);
      payload.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling OAuth2Service.password', function () {

  var service = getSampleService();
  var expectedUrl = '/services/oauth2/token?client_id=testConsumerKey&client_secret=testConsumerSecret&grant_type=password';

  it('should return error if response signature is missing', function (done) {
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    var expectedError = {
      message: 'Missing payload signature.',
      statusCode: 500,
      response: '{}'
    };

    service.password({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should return error if response signature is invalid', function (done) {
    var mockResponse = {signature: 'invalidSignature', id: 'https://testDomain.com', issued_at:'1332093834282'};
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    var expectedError = {
      message: 'The signature could not be verified.',
      statusCode: 500,
      response: JSON.stringify(mockResponse)
    };

    service.password({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should send the right request and receive the right response', function (done) {
    var mockResponse = {
        id: 'https://testDomain.com',
        issued_at: '1332093834282',
        scope: 'api',
        instance_url: 'https://na14.salesforce.com',
        access_token: '00Dd0000000dsWL!AR8AQCKKVxOwRhqhwXqNthdufggKWdUOOrp866CrJeEqF41eYP1kxtYmLMGxTkfRjFbzsD.Aqh8wvDyKyOPAVrDuyJS_bh2.'
    };
    var hmac = crypto.createHmac('sha256', 'testConsumerSecret');
    hmac.update(mockResponse.id);
    hmac.update(mockResponse.issued_at);
    mockResponse.signature = hmac.digest('base64');

    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    service.password({}, function(error, payload) {
      should.not.exist(error);
      payload.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling OAuth2Service.refresh', function () {

  var service = getSampleService();
  var expectedUrl = '/services/oauth2/token?client_id=testConsumerKey&client_secret=testConsumerSecret&redirect_uri=testCallbackUrl&grant_type=refresh_token';

  it('should return error if response signature is missing', function (done) {
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    var expectedError = {
      message: 'Missing payload signature.',
      statusCode: 500,
      response: '{}'
    };

    service.refresh({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should return error if response signature is invalid', function (done) {
    var mockResponse = {signature: 'invalidSignature', id: 'https://testDomain.com', issued_at:'1332093834282'};
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    var expectedError = {
      message: 'The signature could not be verified.',
      statusCode: 500,
      response: JSON.stringify(mockResponse)
    };

    service.refresh({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should send the right request and receive the right response', function (done) {
    var mockResponse = {
        id: 'https://testDomain.com',
        issued_at: '1332093834282',
        scope: 'api',
        instance_url: 'https://na14.salesforce.com',
        access_token: '00Dd0000000dsWL!AR8AQCKKVxOwRhqhwXqNthdufggKWdUOOrp866CrJeEqF41eYP1kxtYmLMGxTkfRjFbzsD.Aqh8wvDyKyOPAVrDuyJS_bh2.'
    };
    var hmac = crypto.createHmac('sha256', 'testConsumerSecret');
    hmac.update(mockResponse.id);
    hmac.update(mockResponse.issued_at);
    mockResponse.signature = hmac.digest('base64');

    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    service.refresh({}, function(error, payload) {
      should.not.exist(error);
      payload.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling OAuth2Service.revoke', function () {

  var service = getSampleService();
  var expectedUrl = '/services/oauth2/revoke?token=testToken';

  it('should throw error if token is not set', function () {
    (function() {
      service.revoke({});
    }).should.throw('Missing token.');
  });

  it('should send the right request and receive the right response', function (done) {
    var server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    service.revoke({token: 'testToken'}, function(error, payload) {
      should.not.exist(error);
      should.not.exist(payload);
      server.done();
      done();
    });
  });
});
