/**
 * @module models/utilities/Logger
 * @author yianni.ververis@qlik.com
 * @param {string} host - Qlik Sense DNS
 * @param {string} appId - QVF ID
 * @param {string} expr - Sense Expression to create the Kpi via a Hypercube
 * @param {string} userDirectory - The UserDirectory for AutoTicketing
 * @param {string} userId - The UserId for AutoTicketing
 * @description
 * Winston Logger Utility. Saves the server logs based on the date.
*/

var winston = require('winston');
require('winston-daily-rotate-file');
winston.emitErrs = true;

let mydate = new Date();
let timestamp = `${mydate.getUTCHours() - 4}:${mydate.getUTCMinutes()}}`;

var logger = new winston.Logger({
	transports: [
		new winston.transports.DailyRotateFile({
			filename: `./logs/log`,
			datePattern: 'yyyy-MM-dd.',
			prepend: true,
			handleExceptions: true,
			maxsize: 1048576, //1MB
			prettyPrint: true,
			showLevel: false,
			timestamp: function () { return timestamp; },
			level: 'debug' // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
		}),
		new winston.transports.Console({
			level: 'debug',
			handleExceptions: true,
			colorize: true
		})
	],
	exitOnError: false
});

module.exports = logger;