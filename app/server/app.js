/**
 * @module app
 * @author yianni.ververis@qlik.com
 * @description
 * Here is the main logic. We define routes, cors, session and error handling through out the app 
*/

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const passport = require('passport');
const session = require('express-session')
const cors = require('cors'); // Whitelisting domains to access our APIs
var uid = require('uid-safe'); // For Session Unique IDs

/**
 * Define all of the paths
 */
const api = require('./routes/api');
const routes = require('./routes/index');
const logger = require('./models/utilities/Logger');
const app = express();

/**
 * View engine for the public folder. If we want to server images and handle all the public views as 'Not Authorized since this is only an API server'
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Define global middleware.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
	genid: function () {
		return uid.sync(18)	 // use UUIDs for session IDs 
	},
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: {
		path: '/',
		httpOnly: true,
		secure: false,
		maxAge: null
	}
}))
app.use(passport.initialize());
app.use(passport.session());

/**
 * Define CORS for all pages.
 */
const whitelist = [
	undefined,
	'file://', // Mobile
	'qlikview.com',
	'webapps.qlik.com',
	'http://localhost',
	'https://localhost:3000',
	'http://localhost:8081',
	'https://localhost:8081',
	'https://webapps.qlik.com',
	'https://sense-demo-staging.qlik.com',
	'https://sense-demo.qlik.com',
	'https://demos.qlik.com',
	// Microsoft Bot Framework
	'login.botframework.com', // (Bot authentication)
	'login.microsoftonline.com', // (Bot authentication)
	'westus.api.cognitive.microsoft.com', // (for Luis.ai NLP integration)
	'state.botframework.com', // (Bot state storage for prototyping)
	'cortanabfchanneleastus.azurewebsites.net', // (Cortana channel)
	'cortanabfchannelwestus.azurewebsites.net', // (Cortana Channel)
	'*.botFramework.com', // (channels)
];
if (process.env.NODE_ENV === 'development') {
	whitelist.push(undefined)
}
const corsOptions = {
	origin: function (origin, callback) {
		logger.info(`Origin: '${origin}'`, { module: 'App' });
		logger.info(`Environment: '${process.env.NODE_ENV}'`, { module: 'App' });
		if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
			callback(null, true)
		} else {
			callback(new Error(`${origin} Not allowed by CORS`))
		}
	},
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
	preflightContinue: true
}
app.use(cors(corsOptions));

app.use('/api', api);
app.use('/', routes);


/**
 * production error handler
 * no stacktraces leaked to user
 */
app.use(function (err, req, res) {
	res.status(err.status || 500);
	res.send({
		success: false,
		data: err.message
	});
});

module.exports = app;
