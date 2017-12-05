/**
 * @name Route: sense-bot
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of the https://{domain}/api/sense-bot/ routes
*/

let express = require('express')
let router = express.Router()

let telegram = require('./sense-bot/telegram')

router.use('/telegram', telegram)

module.exports = router;
