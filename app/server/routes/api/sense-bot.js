/**
 * @module routes/api/sense-bot
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of the https://{domain}/api/sense-bot/ routes
*/

let express = require('express')
let router = express.Router()

let telegram = require('./sense-bot/telegram')
let microsoft = require('./sense-bot/microsoft/')

router.use('/telegram', telegram)
router.use('/microsoft', microsoft)

module.exports = router;
