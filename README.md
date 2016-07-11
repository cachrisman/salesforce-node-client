[![Build Status](https://travis-ci.org/pozil/salesforce-node-client.svg?branch=master)](https://travis-ci.org/pozil/salesforce-node-client)

# Salesforce Node Client

**Table of Content**
- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
	- Configuring and instantiating the client
	- Authenticating
	- Accessing & modifying Force.com data
- [Sample application](#sample-application)

# About
Node.js client library for Salesforce Force.com services.

This libary provices access to 2 main Force.com services:
- Authentication through OAuth 2.0
- Data through Force.com REST APIs

The authentication service of this project is largely inspired by [cangencer's project](https://github.com/cangencer/salesforce-oauth2).


## Installation
This project can be installed through NPM:
```sh
$ npm install salesforce-node-client --save
```

## Documentation

### Configuring and  instantiating the client
The first thing that you need to do to use this project is to set its configuration and create a client instance.

To do so, create a configuration object with this structure:
```js
// Salesforce client settings for Force.com connection
var sfdcConfig = {
  // OAuth2 service
  auth : {
    // OAuth authentication domain
    // For production or DE use
    domain : 'https://login.salesforce.com',
    // For sandbox use
    //domain : 'https://test.salesforce.com',

    // URL called by Force.com after authorization and used to extract an authorization code.
    // This should point to your app and match the value configured in your App in SFDC setup)
    callbackUrl : 'http://localhost:3000/auth/callback',

    // Set of secret keys that allow your app to authenticate with Force.com
    // These values are retrieved from your App configuration in SFDC setup.
    // NEVER share them with a client.
    consumerKey : 'your consumer key',
    consumerSecret : 'your consumer secret key',
  },
  // Data service
  data : {
    // Force.com API version
    apiVersion : 'v37.0'
  }
};
```

Then, create an instance of the service with the following code:
```js
SalesforceClient = require('salesforce-node-client');

// Instantiate Salesforce client with configuration
var sfdc = new SalesforceClient(sfdcConfig);
```

Once this is done, you may access the underlying client services with these properties:
- `auth` for the authentication servcie
- `data` for the data service

### Authenticating
Prior to performing any operation, you will need to authenticate with Force.com.

There are two authentication methods available:
- Standard user authentication that requires a browser user interface.
- Password authentication for API operations that do not provide a UI.

Work in progress...


### Accessing & modifying Force.com data
Work in progress...

## Sample application
A sample React.js application that integrates with Salesforce using this client can be found in [this repository](https://github.com/pozil/salesforce-react-integration).<br/>
Even if you are not familiar with React.js, the Node.js backend code is worth looking at.
