/**
*  Salesforce OAuth2 authentication service.
*  Largely inspired by https://github.com/cangencer/salesforce-oauth2
*  Additional doc: http://wiki.developerforce.com/page/Digging_Deeper_into_OAuth_2.0_on_Force.com
*/

// Dependencies
const qs = require('querystring'),
  _ = require('underscore'),
  httpClient = require('request'),
  crypto = require('crypto');

// OAuth resources URLs
const resourceUrlSuffix = {
  authorize : 'authorize',
  token : 'token',
  revoke : 'revoke'
}

// Try to use proxy if available
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;

var config = null;

/**
*    Instantiates OAuth2 service with provided configuration
*    @configuration should contain:
*      domain: OAuth authentication domain
*      callbackUrl: URL called by Force.com after authorization
*      consumerKey: OAuth consumuer key used for Force.com authentication (retrieved from SFDC setup)
*      consumerSecret: OAuth secret key used for Force.com authentication (retrieved from SFDC setup)
*/
const OAuth2Service = function (configuration) {
  config = configuration;
};

/**
*  Get the URL to redirect to get the user approval.
*  @options may contain:
*    scope: A space separated list of scope values. Sample: api chatter
*
*    For a full list of parameters see http://wiki.developerforce.com/page/Digging_Deeper_into_OAuth_2.0_on_Force.com
*/
OAuth2Service.prototype.getAuthorizationUrl = function (options) {
  const extendedOptions = _.extend({
    'client_id': config.consumerKey,
    'redirect_uri': config.callbackUrl,
    'response_type': 'code'
  }, options);

  return buildServiceUrl(resourceUrlSuffix.authorize, extendedOptions);
};

/**
*  Send the authentication code to the server and get the access token.
*  @options should contain the following:
*    code: authorization code
*/
OAuth2Service.prototype.authenticate = function (options, callback) {
  if (!options.code)
    throw new Error('Missing authorization code');
  const extendedOptions = _.extend({
    'client_id': config.consumerKey,
    'client_secret': config.consumerSecret,
    'redirect_uri': config.callbackUrl,
    'grant_type': 'authorization_code'
  }, options);
  callService(resourceUrlSuffix.token, extendedOptions, callback);

  /*
  The reponse payload should contain the following fields:

  id              A URL, representing the authenticated user,
                  which can be used to access the Identity Service.

  issued_at       The time of token issue, represented as the
                  number of seconds since the Unix epoch
                  (00:00:00 UTC on 1 January 1970).

  refresh_token   A long-lived token that may be used to obtain
                  a fresh access token on expiry of the access
                  token in this response.

  instance_url    Identifies the Salesforce instance to which API
                  calls should be sent.

  access_token    The short-lived access token.


  The signature field will be verified automatically and can be ignored.

  At this point, the client application can use the access token to authorize requests
  against the resource server (the Force.com instance specified by the instance URL)
  via the REST APIs, providing the access token as an HTTP header in
  each request:

  Authorization: Bearer 00D50000000IZ3Z!AQ0AQDpEDKYsn7ioKug2aSmgCjgrPjG...
  */
};

/**
*  Send the username and password to the server and get the access token.
*  @options should contain the following:
*    username: The API user's Salesforce.com username, of the form user@example.com
*    password: The API user's Salesforce.com password. If the client's IP address has not
*              been whitelisted in your org, you must concatenate the security token with
*              the password.
*/
OAuth2Service.prototype.password = function(options, callback) {
  const extendedOptions = _.extend({
    'client_id': config.consumerKey,
    'client_secret': config.consumerSecret,
    'grant_type': 'password'
  }, options);
  callService(resourceUrlSuffix.token, extendedOptions, callback);
}

/**
*  Send the refresh token in order to renew the access token
*  @options should contain the following:
*    refresh_token: the refresh token
*/
OAuth2Service.prototype.refresh = function (options, callback) {
  const extendedOptions = _.extend({
    'client_id': config.consumerKey,
    'client_secret': config.consumerSecret,
    'redirect_uri': config.callbackUrl,
    'grant_type': 'refresh_token'
  }, options);
  callService(resourceUrlSuffix.token, extendedOptions, callback);
}

/**
*  Revokes the current token (logs out)
*  @options must contain the following:
*    token: the token
*/
OAuth2Service.prototype.revoke = function (options, callback) {
  if (!options.token)
    throw new Error('Missing token.');
  // Special service call: not using callService function as response is ignored
  const uri = buildServiceUrl(resourceUrlSuffix.revoke, options);
  return httpClient.post({
    url: uri,
    proxy: proxyUrl
  }, function (err, response) {
    // Check for errors
    if (err)
      return callback(err);
    if (response.statusCode >= 400) {
      return callback({
        message: response.body,
        statusCode: response.statusCode
      });
    }
    // Ignore response body
    return callback(null);
  });
}


/**
*  Calls the Force.com authentication service and returns the response through the provided callback function
*  @serviceUrl base service URL (must be one of resourceUrlSuffix.* values)
*  @options object containing request options
*  @callback function called when response is received
*/
function callService(serviceUrl, options, callback) {
  const uri = buildServiceUrl(serviceUrl, options);

  httpClient.post({
    url: uri,
    proxy: proxyUrl
  }, function (err, response) {
    // Check for errors
    if (err) {
      return callback(err);
    }
    if (response.statusCode >= 400) {
      return callback({
        message: response.body,
        statusCode: response.statusCode
      });
    }
    // Parse & validate response then return payload in callback
    try {
      const payload = JSON.parse(response.body);
      verifySignature(payload);
      return callback(null, payload);
    } catch (e) {
      return callback({
        message: e.message,
        statusCode: 500,
        response: response.body
      });
    }
  });
};

/**
*  Builds a URL to call one of the OAuth services
**/
function buildServiceUrl(resourceUrlSuffix, options) {
  return config.domain +'/services/oauth2/'+ resourceUrlSuffix + '?' + qs.stringify(options);
}

/**
*  Checks the OAuth signature in data returned by a response
*  Throws an exception if signature is invalid else, does nothing.
*  @payload body of HTTP reponse returned by Salesforce
*/
function verifySignature(payload) {
  if (!payload || !payload.signature)
    throw new Error('Missing payload signature.');

  const hmac = crypto.createHmac('sha256', config.consumerSecret);
  hmac.update(payload.id);
  hmac.update(payload.issued_at);

  if (hmac.digest('base64') !== payload.signature)
    throw new Error('The signature could not be verified.');
}

// Export service in module
module.exports = OAuth2Service;
