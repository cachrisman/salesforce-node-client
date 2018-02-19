const OAuth2Service = require('./services/oauth2'),
  DataService = require('./services/data'),
  ApexRestService = require('./services/apexrest'),
  _ = require('underscore');

/**
*    Instantiates Salesforce client with provided configuration or via env variables (if configuration argument is not set)
*    @configuration (optional) should contain the following attributes:
*      domain: OAuth authentication domain
*      callbackUrl: URL called by Force.com after authorization
*      consumerKey: OAuth consumuer key used for Force.com authentication (retrieved from SFDC setup)
*      consumerSecret: OAuth secret key used for Force.com authentication (retrieved from SFDC setup)
*      apiVersion: Force.com API version
*/
const SalesforceClient = function (configuration) {
  let extendedConfig = {};
  if (typeof configuration === 'undefined') { // Support env configuration
    extendedConfig = process.env;
  } else if (typeof configuration['auth'] !== 'undefined' && typeof configuration['data'] !== 'undefined') { // Support legacy (v1.1) split configuration
    extendedConfig = _.extend(extendedConfig, configuration.auth, configuration.data);
  } else { // Support flat configuration
    extendedConfig = configuration;
  }

  assertConfigAttributesAreSet(extendedConfig, ['domain', 'callbackUrl', 'consumerKey', 'consumerSecret', 'apiVersion']);

  if (extendedConfig.apiVersion.charAt(0) !== 'v') {
    throw new Error('Salesforce client apiVersion should start with letter "v"');
  }

  this.auth = new OAuth2Service(extendedConfig);
  this.data = new DataService(extendedConfig);
  this.apex = new ApexRestService();
};

/**
*  Asserts that the provided configuration attribute are set.
*  Throws an exception if not.
*/
function assertConfigAttributesAreSet(configuration, attributes) {
  attributes.forEach(function (attribute) {
    if (typeof configuration[attribute] === 'undefined')
      throw new Error('Missing configuration attribute for Salesforce client: '+ attribute);
  });
}

// Export to module
module.exports = SalesforceClient;
