/**
 * @module models/sense-bot
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of models for route sense-bot
*/

let site = {};

// Utilities
site.logger = require('./utilities/Logger');
site.enigma = require('./utilities/Enigma');
// Page Models
site.telegram = require('./sense-bot/Telegram');
site.skype = require('./sense-bot/Microsoft');

module.exports = site;