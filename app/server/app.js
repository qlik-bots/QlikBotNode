/**
 * @module app
 * @author yianni.ververis@qlik.com
 * @description
 * Here is the main logic. We define routes, cors, session and error handling through out the app 
*/

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
var uid = require('uid-safe'); // For Session Unique IDs

/**
 * Define all of the paths
 */
const api = require('./routes/api');
const routes = require('./routes/index');
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
	genid: function () {
		return uid.sync(18); // use UUIDs for session IDs 
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
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);
app.use('/', routes);

module.exports = app;
