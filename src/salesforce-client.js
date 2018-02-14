const OAuth2Service = require('./services/oauth2'),
  DataService = require('./services/data'),
  ApexRestService = require('./services/apexrest');

/**
*    Instantiates Salesforce client with provided configuration
*    @configuration should contain Data and OAuth2 service configuration
*/
const SalesforceClient = function (configuration) {
  if (!configuration)
    throw new Error('Missing configuration for Salesforce client');

  this.auth = new OAuth2Service(configuration.auth);
  this.data = new DataService(configuration.data);
  this.apex = new ApexRestService();
};


// Export to module
module.exports = SalesforceClient;
