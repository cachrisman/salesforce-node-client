/**
*  Salesforce Force.com data REST API service
*  Usage requires Salesforce OAuth2 authentication
*/

// Dependencies
const httpClient = require("request");


// Service configuration
var config = null;


/**
*  Instantiates Force.com data service with provided configuration
*  @configuration should contain:
*    apiVersion: Force.com API version
*/
const DataService = function (configuration) {
  config = configuration;
};

/**
*  Gets the currently logged in user
*  @authSession Force.com session
*  @callback function called back with user data
*/
DataService.prototype.getLoggedUser = function (authSession, callback) {
  const requestOptions = {
    method: 'GET',
    url: authSession.id
  };
  authorizeRequest(authSession, requestOptions);
  httpClient(requestOptions, function(error, payload) {
    callback(error, (payload ? payload.body : null));
  });
};

/**
*  Creates setting for a data REST API call
*  @authSession Force.com session
*  @resourceUrlSuffix a string with the URL suffix describing the resource queried (eg: query, account...)
**/
DataService.prototype.createDataRequest = function (authSession, resourceUrlSuffix) {
  const requestOptions = {
    url : buildApiUrl(authSession, resourceUrlSuffix),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  authorizeRequest(authSession, requestOptions);
  return requestOptions;
};

/**
*  Applies authorization header to request
**/
function authorizeRequest(authSession, options) {
  if (!options.headers)
    options.headers = {};
  options.headers.Authorization = 'Bearer '+ authSession.access_token;
}

/**
*  Builds a URL to call a data REST APIs
**/
function buildApiUrl(authSession, resourceUrlSuffix) {
  return authSession.instance_url + '/services/data/' + config.apiVersion +'/'+ resourceUrlSuffix;
}


// Export service in module
module.exports = DataService;
