const should = require('should'),
  nock = require('nock'),
  crypto = require('crypto');

const OAuth2Service = require('../../src/services/oauth2');

// Shared test data
const SAMPLE_SERVICE = new OAuth2Service({
  domain: 'https://testDomain.com',
  callbackUrl: 'testCallbackUrl',
  consumerKey: 'testConsumerKey',
  consumerSecret: 'testConsumerSecret'
});


describe('when calling OAuth2Service.getAuthorizationUrl', function () {

  it('should return the correct URL', function () {
    const options = {scope: 'api'};
    const expectedUrl = 'https://testDomain.com/services/oauth2/authorize?client_id=testConsumerKey&redirect_uri=testCallbackUrl&response_type=code&scope=api';

    const actualUrl = SAMPLE_SERVICE.getAuthorizationUrl(options);

    actualUrl.should.eql(expectedUrl);
  });
});


describe('when calling OAuth2Service.authenticate', function () {

  const expectedUrl = '/services/oauth2/token?client_id=testConsumerKey&client_secret=testConsumerSecret&redirect_uri=testCallbackUrl&grant_type=authorization_code&code=testCode';

  it('should throw error if authorization code is not set', function () {
    (function() {
	  SAMPLE_SERVICE.authenticate({});
    }).should.throw('Missing authorization code');
  });

  it('should return error if response signature is missing', function (done) {
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    const expectedError = {
      message: 'Missing payload signature.',
      statusCode: 500,
      response: '{}'
    };

    SAMPLE_SERVICE.authenticate({code: 'testCode'}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should return error if response signature is invalid', function (done) {
    const mockResponse = {signature: 'invalidSignature', id: 'https://testDomain.com', issued_at:'1332093834282'};
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    const expectedError = {
      message: 'The signature could not be verified.',
      statusCode: 500,
      response: JSON.stringify(mockResponse)
    };

    SAMPLE_SERVICE.authenticate({code: 'testCode'}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should send the right request and receive the right response', function (done) {
    const mockResponse = {
        id: 'https://testDomain.com',
        issued_at: '1332093834282',
        scope: 'api',
        instance_url: 'https://na14.salesforce.com',
        access_token: '00Dd0000000dsWL!AR8AQCKKVxOwRhqhwXqNthdufggKWdUOOrp866CrJeEqF41eYP1kxtYmLMGxTkfRjFbzsD.Aqh8wvDyKyOPAVrDuyJS_bh2.'
    };
    const hmac = crypto.createHmac('sha256', 'testConsumerSecret');
    hmac.update(mockResponse.id);
    hmac.update(mockResponse.issued_at);
    mockResponse.signature = hmac.digest('base64');

    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

	SAMPLE_SERVICE.authenticate({code: 'testCode'}, function(error, payload) {
      should.not.exist(error);
      payload.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling OAuth2Service.password', function () {

  const expectedUrl = '/services/oauth2/token?client_id=testConsumerKey&client_secret=testConsumerSecret&grant_type=password';

  it('should return error if response signature is missing', function (done) {
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    const expectedError = {
      message: 'Missing payload signature.',
      statusCode: 500,
      response: '{}'
    };

    SAMPLE_SERVICE.password({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should return error if response signature is invalid', function (done) {
    const mockResponse = {signature: 'invalidSignature', id: 'https://testDomain.com', issued_at:'1332093834282'};
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    const expectedError = {
      message: 'The signature could not be verified.',
      statusCode: 500,
      response: JSON.stringify(mockResponse)
    };

    SAMPLE_SERVICE.password({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should send the right request and receive the right response', function (done) {
    const mockResponse = {
        id: 'https://testDomain.com',
        issued_at: '1332093834282',
        scope: 'api',
        instance_url: 'https://na14.salesforce.com',
        access_token: '00Dd0000000dsWL!AR8AQCKKVxOwRhqhwXqNthdufggKWdUOOrp866CrJeEqF41eYP1kxtYmLMGxTkfRjFbzsD.Aqh8wvDyKyOPAVrDuyJS_bh2.'
    };
    const hmac = crypto.createHmac('sha256', 'testConsumerSecret');
    hmac.update(mockResponse.id);
    hmac.update(mockResponse.issued_at);
    mockResponse.signature = hmac.digest('base64');

    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

	SAMPLE_SERVICE.password({}, function(error, payload) {
      should.not.exist(error);
      payload.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling OAuth2Service.refresh', function () {

  const expectedUrl = '/services/oauth2/token?client_id=testConsumerKey&client_secret=testConsumerSecret&redirect_uri=testCallbackUrl&grant_type=refresh_token';

  it('should return error if response signature is missing', function (done) {
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

    const expectedError = {
      message: 'Missing payload signature.',
      statusCode: 500,
      response: '{}'
    };

    SAMPLE_SERVICE.refresh({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should return error if response signature is invalid', function (done) {
    const mockResponse = {signature: 'invalidSignature', id: 'https://testDomain.com', issued_at:'1332093834282'};
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

    const expectedError = {
      message: 'The signature could not be verified.',
      statusCode: 500,
      response: JSON.stringify(mockResponse)
    };

    SAMPLE_SERVICE.refresh({}, function(error, payload) {
      error.should.eql(expectedError);
      server.done();
      done();
    });
  });

  it('should send the right request and receive the right response', function (done) {
    const mockResponse = {
        id: 'https://testDomain.com',
        issued_at: '1332093834282',
        scope: 'api',
        instance_url: 'https://na14.salesforce.com',
        access_token: '00Dd0000000dsWL!AR8AQCKKVxOwRhqhwXqNthdufggKWdUOOrp866CrJeEqF41eYP1kxtYmLMGxTkfRjFbzsD.Aqh8wvDyKyOPAVrDuyJS_bh2.'
    };
    const hmac = crypto.createHmac('sha256', 'testConsumerSecret');
    hmac.update(mockResponse.id);
    hmac.update(mockResponse.issued_at);
    mockResponse.signature = hmac.digest('base64');

    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, mockResponse);

	SAMPLE_SERVICE.refresh({}, function(error, payload) {
      should.not.exist(error);
      payload.should.eql(mockResponse);
      server.done();
      done();
    });
  });
});


describe('when calling OAuth2Service.revoke', function () {

  const expectedUrl = '/services/oauth2/revoke?token=testToken';

  it('should throw error if token is not set', function () {
    (function() {
	  SAMPLE_SERVICE.revoke({});
    }).should.throw('Missing token.');
  });

  it('should send the right request and receive the right response', function (done) {
    const server = nock('https://testDomain.com')
      .post(expectedUrl)
      .reply(200, {});

	SAMPLE_SERVICE.revoke({token: 'testToken'}, function(error, payload) {
      should.not.exist(error);
      should.not.exist(payload);
      server.done();
      done();
    });
  });
});
