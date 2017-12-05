## Modules

<dl>
<dt><a href="#module_app">app</a></dt>
<dd><p>Here is the main logic. We define routes, cors, session and error handling through out the app</p>
</dd>
<dt><a href="#module_server">server</a></dt>
<dd><p>Here is the initialization of the server. We define ports, certificates and error handling</p>
</dd>
<dt><a href="#module_routes/api">routes/api</a></dt>
<dd><p>Handle all of the <a href="https://{domain}/api/">https://{domain}/api/</a> routes</p>
</dd>
<dt><a href="#module_routes/index">routes/index</a></dt>
<dd><p>Handle all of the public front end routes</p>
</dd>
<dt><a href="#module_models/sense-bot">models/sense-bot</a></dt>
<dd><p>Handle all of models for route sense-bot</p>
</dd>
<dt><a href="#module_routes/api/sense-bot">routes/api/sense-bot</a></dt>
<dd><p>Handle all of the <a href="https://{domain}/api/sense-bot/">https://{domain}/api/sense-bot/</a> routes</p>
</dd>
<dt><a href="#module_models/utilities/DB">models/utilities/DB</a></dt>
<dd><p>main wrapper for connecting and quering the MySql Database</p>
</dd>
<dt><a href="#module_models/utilities/Enigma">models/utilities/Enigma</a></dt>
<dd><p>Main wrapper for Enigma.js</p>
</dd>
<dt><a href="#module_models/utilities/Logger">models/utilities/Logger</a></dt>
<dd><p>Winston Logger Utility. Saves the server logs based on the date.</p>
</dd>
<dt><a href="#module_models/sense-bot/Db">models/sense-bot/Db</a></dt>
<dd><p>Wrapper of the main DB class with the config file</p>
</dd>
<dt><a href="#module_models/sense-bot/Skype">models/sense-bot/Skype</a></dt>
<dd><p>The main Model for all of the Microsoft Channels. Stores and retrieves users from the database</p>
</dd>
<dt><a href="#module_models/sense-bot/Telegram">models/sense-bot/Telegram</a></dt>
<dd><p>The main Model for all of the Microsoft Channels. Stores and retrieves users from the database</p>
</dd>
<dt><a href="#module_routes/api/sense-bot/telegram">routes/api/sense-bot/telegram</a></dt>
<dd><p>Handle all of the <a href="https://{domain}/api/sense-bot/telegram/">https://{domain}/api/sense-bot/telegram/</a> routes</p>
</dd>
</dl>

<a name="module_app"></a>

## app
Here is the main logic. We define routes, cors, session and error handling through out the app

**Author:** yianni.ververis@qlik.com  

* [app](#module_app)
    * [~api](#module_app..api)
    * [~whitelist](#module_app..whitelist)

<a name="module_app..api"></a>

### app~api
Define all of the paths

**Kind**: inner constant of <code>[app](#module_app)</code>  
<a name="module_app..whitelist"></a>

### app~whitelist
Define CORS for all pages.

**Kind**: inner constant of <code>[app](#module_app)</code>  
<a name="module_server"></a>

## server
Here is the initialization of the server. We define ports, certificates and error handling

**Author:** yianni.ververis@qlik.com  

* [server](#module_server)
    * [~certFolder](#module_server..certFolder)
    * [~httpsServer](#module_server..httpsServer)
    * [~normalizePort()](#module_server..normalizePort)
    * [~onError()](#module_server..onError)

<a name="module_server..certFolder"></a>

### server~certFolder
Create HTTP/HTTPS server.

**Kind**: inner property of <code>[server](#module_server)</code>  
<a name="module_server..httpsServer"></a>

### server~httpsServer
Create the server

**Kind**: inner constant of <code>[server](#module_server)</code>  
<a name="module_server..normalizePort"></a>

### server~normalizePort()
Normalize a port into a number, string, or false.

**Kind**: inner method of <code>[server](#module_server)</code>  
<a name="module_server..onError"></a>

### server~onError()
Event listener for HTTP/HTTPS server "error" event.

**Kind**: inner method of <code>[server](#module_server)</code>  
<a name="module_routes/api"></a>

## routes/api
Handle all of the https://{domain}/api/ routes

**Author:** yianni.ververis@qlik.com  
<a name="module_routes/index"></a>

## routes/index
Handle all of the public front end routes

**Author:** yianni.ververis@qlik.com  
<a name="module_models/sense-bot"></a>

## models/sense-bot
Handle all of models for route sense-bot

**Author:** yianni.ververis@qlik.com  
<a name="module_routes/api/sense-bot"></a>

## routes/api/sense-bot
Handle all of the https://{domain}/api/sense-bot/ routes

**Author:** yianni.ververis@qlik.com  
<a name="module_models/utilities/DB"></a>

## models/utilities/DB
main wrapper for connecting and quering the MySql Database

**Author:** yianni.ververis@qlik.com  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration for host, database name, username and password |

<a name="module_models/utilities/Enigma"></a>

## models/utilities/Enigma
Main wrapper for Enigma.js

**Author:** yianni.ververis@qlik.com  

| Param | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | Qlik Sense DNS |
| appId | <code>string</code> | QVF ID |
| expr | <code>string</code> | Sense Expression to create the Kpi via a Hypercube |
| userDirectory | <code>string</code> | The UserDirectory for AutoTicketing |
| userId | <code>string</code> | The UserId for AutoTicketing |

<a name="module_models/utilities/Logger"></a>

## models/utilities/Logger
Winston Logger Utility. Saves the server logs based on the date.

**Author:** yianni.ververis@qlik.com  

| Param | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | Qlik Sense DNS |
| appId | <code>string</code> | QVF ID |
| expr | <code>string</code> | Sense Expression to create the Kpi via a Hypercube |
| userDirectory | <code>string</code> | The UserDirectory for AutoTicketing |
| userId | <code>string</code> | The UserId for AutoTicketing |

<a name="module_models/sense-bot/Db"></a>

## models/sense-bot/Db
Wrapper of the main DB class with the config file

**Author:** yianni.ververis@qlik.com  
**Todo**

- [ ] remove the wrapper and have classes communicate directly with models/utilities/DB.js


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration for host, database name, username and password |

<a name="module_models/sense-bot/Skype"></a>

## models/sense-bot/Skype
The main Model for all of the Microsoft Channels. Stores and retrieves users from the database

**Author:** yianni.ververis@qlik.com  

| Param | Type | Description |
| --- | --- | --- |
| all | <code>boolean</code> | return all of the users in the Database |
| count | <code>integer</code> | Return a total of all the users from the sql query |
| userId | <code>integer</code> | get specific user |
| userUid | <code>string</code> | get specific user |
| limit | <code>integer</code> | limit results |
| username | <code>string</code> | Find user |
| channelId | <code>integer</code> | Specific channel |
| userData | <code>object</code> | The message specific data for mass Instant Messaging |

<a name="module_models/sense-bot/Telegram"></a>

## models/sense-bot/Telegram
The main Model for all of the Microsoft Channels. Stores and retrieves users from the database

**Author:** yianni.ververis@qlik.com  

| Param | Type | Description |
| --- | --- | --- |
| all | <code>boolean</code> | return all of the users in the Database |
| count | <code>integer</code> | Return a total of all the users from the sql query |
| userId | <code>integer</code> | get specific user |
| userUid | <code>string</code> | get specific user |
| limit | <code>integer</code> | limit results |
| username | <code>string</code> | Find user |
| channelId | <code>integer</code> | Specific channel |
| userData | <code>object</code> | The message specific data for mass Instant Messaging |

<a name="module_routes/api/sense-bot/telegram"></a>

## routes/api/sense-bot/telegram
Handle all of the https://{domain}/api/sense-bot/telegram/ routes

**Author:** yianni.ververis@qlik.com  
**Todo**

- [ ] move the qvfs into a config file

<a name="module_routes/api/sense-bot/telegram..qvf"></a>

### routes/api/sense-bot/telegram~qvf
Connection parameters for the QVFs

**Kind**: inner property of <code>[routes/api/sense-bot/telegram](#module_routes/api/sense-bot/telegram)</code>  
**Todo**

- [ ] move the qvfs into a config file

