/**
*  Salesforce Force.com data REST API service
*  Usage requires Salesforce OAuth2 authentication
*/

// Dependencies
const httpClient = require("request");


/**
*  Instantiates Force.com apex REST service
*/
const ApexRestService = function () {
};

/**
*  Creates setting for an Apex REST API call
*  @authSession Force.com session
*  @resourceUrlSuffix a string with the URL suffix describing the resource queried (eg: Account/...)
**/
ApexRestService.prototype.createApexRequest = function (authSession, resourceUrlSuffix) {
  const requestOptions = {
    url : buildApiUrl(authSession, resourceUrlSuffix)
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
*  Builds a URL to call a Apex REST APIs
**/
function buildApiUrl(authSession, resourceUrlSuffix) {
  return authSession.instance_url + '/services/apexrest/'+ resourceUrlSuffix;
}


// Export service in module
module.exports = ApexRestService;
