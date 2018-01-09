/**
 * @module models/sense-bot
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of models for route sense-bot
*/

let site = {};

// Utilities
site.logger = require('./utilities/Logger');
site.Enigma = require('./utilities/Enigma');
// Page Models
site.Telegram = require('./sense-bot/Telegram');
site.Skype = require('./sense-bot/Microsoft');

module.exports = site;