/**
 * @name Main: Server
 * @author yianni.ververis@qlik.com
 * @description
 * Here is the initialization of the server. We define ports, certificates and error handling
*/

const app = require('./app');
const https = require('https');
const fs = require('fs');
const path = require('path');
const logger = require('./models/utilities/Logger');


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
		// named pipe
		return val;
	}
	if (port >= 0) {
		return port;
		// port number
	}
	return false;
}

// Put these at the end because Lint is crying...
let port = normalizePort(process.env.PORT || '3443');
app.set('port', port);

/**
 * Event listener for HTTP/HTTPS server "error" event.
 */
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}
	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			logger.error(`${bind} requires elevated privileges`, { module: 'server' });
			process.exit(1);
			break;
		case 'EADDRINUSE':
			logger.error(`${bind} is already in use`, { module: 'server' });
			process.exit(1);
			break;
		default:
			throw error;
	}
}


/**
 * Create HTTP/HTTPS server.
 */
var certFolder = (process.env.NODE_ENV == 'development') ? 'localhost' : 'demosapi.qlik.com';
var keyPath = path.join(__dirname, 'certs', certFolder, 'server_key.pem');
var serverPath = path.join(__dirname, 'certs', certFolder, 'server.pem');
const options = {
	key: fs.readFileSync(keyPath),
	cert: fs.readFileSync(serverPath)
};

/**
 * Create the server
 */
const httpsServer = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */
httpsServer.listen(port, '0.0.0.0'); // localhost breaks on server
httpsServer.on('error', onError);
