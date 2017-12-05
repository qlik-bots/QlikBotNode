/**
 * @name Model: sense-bot
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of models for route sense-bot
*/

let site = {}

// Utilities
site.logger = require('./utilities/Logger');
site.enigma = require('./utilities/Enigma');
// Page Models
site.skype = require('./sense-bot/Skype')

module.exports = site