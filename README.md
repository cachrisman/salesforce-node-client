[![Build Status](https://travis-ci.org/pozil/salesforce-node-client.svg?branch=master)](https://travis-ci.org/pozil/salesforce-node-client)

# Salesforce Node Client

**Table of Content**
- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
	- Declaring your application in Salesforce
	- Configuring and instantiating the client
	- Authenticating
	- Interacting with Salesforce data
	- Interacting with Apex REST resources
- [Changelog](../../releases)


# About
Node.js client library for the Salesforce Platform.

This library provides access to the following Salesforce Platform services:
- Authentication through OAuth 2.0
- Data through Salesforce Platform REST APIs
- Apex REST resources

This client is provided “as is“ without any warranty or support. Salesforce does not officially endorse it.

**Credit**<br/>
The authentication service of this project is largely inspired by [cangencer's project](https://github.com/cangencer/salesforce-oauth2).

**Sample application**<br/>
A sample React.js application that integrates with Salesforce using this client can be found in [this repository](https://github.com/pozil/salesforce-react-integration).<br/>
Even if you are not familiar with React.js, the Node.js backend code is worth looking at.


## Installation
This project can be installed through NPM:
```sh
$ npm install salesforce-node-client --save
```

## Documentation

### Declaring your application in Salesforce

Before being able to interact with the Salesforce Platform with your application, you will have to declare it as a connected application:

1. Log in your Salesforce administrator account
2. Access Setup
3. Type 'App' in the quick find box and navigate to Build > Create > Apps
4. Scroll down and click 'New' in the 'Connected Apps' section
5. Fill in the required fields in the 'Basic Information' section
6. Check 'Enable OAuth Settings', this will open some additional settings
7. Provide a callback URL (this is an endpoint belonging to your application that should match `auth.callbackUrl` specified in the client configuration later)
8. Select your OAuth scope(s) ('api' is a good start)
9. Save your settings


### Configuring and instantiating the client
The first thing that you need to do to use this project is to set its configuration and create a client instance.

There are two options to configure the client:

**Option 1: instantiating the client with a configuration object**
```js
const SalesforceClient = require('salesforce-node-client');

// Settings for Salesforce connection
const sfdcConfig = {
  // OAuth authentication domain
  // For production or a Developer Edition (DE) use
  domain: 'https://login.salesforce.com',
  // For a sandbox use
  //domain : 'https://test.salesforce.com',

  // URL called by Salesforce after authorization and used to extract an authorization code.
  // This should point to your app and match the value configured in your App in SFDC setup)
  callbackUrl: 'http://localhost:3000/auth/callback',

  // Set of secret keys that allow your app to authenticate with Salesforce
  // These values are retrieved from your App configuration in SFDC setup.
  // NEVER share them with a client.
  consumerKey: 'your consumer key',
  consumerSecret: 'your consumer secret key',

  // Salesforce API version
  apiVersion: 'v41.0'
};

// Instantiate Salesforce client with configuration
const sfdcClient = new SalesforceClient(sfdcConfig);
```

**Option 2: instantiating the client with Node.js environment variables**

Ensure that the Node.js environment variables (`process.env`) contains the same keys/values as the `sfdcConfig` object in option 1 before calling the client constructor.
You can set environment variables in several ways but I recommend storring them in a `.env` file and loading them with [dotenv](https://www.npmjs.com/package/dotenv) when the server starts.
```js
const SalesforceClient = require('salesforce-node-client');

// Instantiate Salesforce client with Node.js environment variables.
// It's your responsibility to set those ahead of this call or you will get an error.
const sfdcClient = new SalesforceClient();
```


Once the client is instantiated with either options, you may access the underlying client services with these properties:
- `auth` for the authentication service
- `data` for the data service
- `apex` for the apex REST service

### Authenticating
Prior to performing any operation, you will need to authenticate with Salesforce.

There are two authentication methods available:
- Standard user authentication (requires a browser).
- Password authentication for non-browser operations such as programmatic access.


#### Standard user authentication mode
The first step in standard user authentication is to generate the authorization URL with your OAuth scope(s) (API only in in this example) and redirect the user to it:
```js
// Redirect to Salesforce login/authorization page
var uri = sfdc.auth.getAuthorizationUrl({scope: 'api'});
return response.redirect(uri);
```

The user will authorize your application to connect to Salesforce and will be redirected to the `auth.callbackUrl` URL you specified in the client configuration.<br/>
**Important:** the callback URL you specified in the client configuration MUST match your connected applications settings in Salesforce.

The user will be redirected to that call back URL with an authorization code passed as a query parameter.<br/>
The Node client library will use that code (`request.query.code` in the following example) to authenticate with Salesforce.
The, once the authentication is completed:
1. persist the response payload in a server-side session (you will need this for all further operations)
2. redirect the user to your application's home page

```js
// Authenticate with Salesforce
sfdc.auth.authenticate({'code': request.query.code}, function(error, payload) {
	// Store the payload content in a server-side session
	// Redirect your user to your app's home page
});
```

The `authenticate` response `payload` is an object with the following format:

| Attribute     | Description |
| ------------- |-------------|
| id            | URL that represents logged in user |
| issued_at     | Timestamp of token creation |
| refresh_token | Long-lived token that may be used to obtain a fresh access token on expiry of the access token |
| instance_url  | URL that identifies the Salesforce instance to which API calls should be sent |
| access_token  | Short-lived access token |
| signature     | Hash used to sign requests sent to Salesforce (the client library will take care of that for you) |


#### Password authentication mode
In order to perform password authentication, use the following:
```js
// Authenticate with Salesforce
sfdc.auth.password({
	'username': 'the user name',
	'password': 'the user password',
}, function(error, payload) {
	// Store the payload content in a server-side session
	// Do something
});
```


#### Logging out
You may log out a user of your application by revoking his access token `accessToken` with the following code:
```js
// Revokes your user's access to Salesforce
sfdc.auth.revoke({'token': accessToken}, function(error) {
	// Do something
});
```
**Important:** revoking a user's access token logs the user out of your application but not Salesforce.


### Interacting with Salesforce data
Once you have authenticated, you may perform various operations on the Salesforce Platform.

For all operations, you will need the response payload of `auth.authenticate` or `auth.password`.
We will refer to it as `sfdcSession`.

#### Interacting with Salesforce data
Interactions with Salesforce data performed with this client are handled with REST APIs in two steps.

First, prepare the request options and sign it with the client by calling `data.createDataRequest`.
To do so, you will need to provide two paramters:
- `sfdcSession` the session information
- `resourceUrlSuffix` a string containing the location of the REST resource you wish to interact with (you may use the [REST Explorer](https://workbench.developerforce.com/restExplorer.php) from the Workbench to get the right URL).

Finally, send the request with the HTTP verb of your choice and process the response.

```js
// Prepare Salesforce request options with a SOQL query that lists users
var query = encodeURI('SELECT Id, Name FROM User LIMIT 10');
var apiRequestOptions = sfdc.data.createDataRequest(sfdcSession, 'query?q='+ query);
// Send an HTTP GET request with our options
httpClient.get(apiRequestOptions, function (error, payload) {
	// Do something
});
```

#### Retrieving the currently logged user
As a convenience, you can retrieve the currently logged in user with this call:
```js
// Request logged user info
sfdc.data.getLoggedUser(sfdcSession, function (error, userData) {
	// Do something
});
```

### Interacting with Apex REST resources
Apex REST resources can be called in the following way:
```js
// Builds a REST query to a custom Apex resource
var apiRequestOptions = sfdc.apex.createApexRequest(sfdcSession, 'MyCustomApexResource/001B000000RS9WWIA1');
// Send an HTTP GET request with our options
httpClient.get(apiRequestOptions, function (error, payload) {
	// Do something
});
```
